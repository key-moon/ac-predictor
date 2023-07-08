import logging

from typing import List
from datetime import datetime, timedelta
from bs4 import BeautifulSoup, ResultSet, Tag

from ac_predictor_crawler.domain.contestinfo import ContestInfo
from ac_predictor_crawler.domain.raterange import RateRange
from ac_predictor_crawler.requests import get_atcodersession

def parse_contest_row(tr: Tag):
  tds: ResultSet[Tag] = tr.find_all("td")
    
  datetime_anchor = tds[0].find("a")
  if type(datetime_anchor) is not Tag: raise Exception("invalid html")
  datetime_str = datetime_anchor["href"].split("?")[1][4:17] # type: ignore
  start_time = datetime.strptime(datetime_str, "%Y%m%dT%H%M") + timedelta(hours=-9)

  contest_type_span = tds[1].find("span")
  if type(contest_type_span) is not Tag: raise Exception("invalid html")
  contest_type_symbol = contest_type_span.text
  if contest_type_symbol == "Ⓐ": contest_type = "algorithm"
  elif contest_type_symbol == "Ⓗ": contest_type = "heuristic"
  else: raise Exception("invalid contest type symbol", contest_type_symbol)

  contest_anchor = tds[1].find("a")
  if type(contest_anchor) is not Tag: raise Exception("invalid html")
  contest_name = contest_anchor.text
  contest_screen_name = contest_anchor["href"].split("/")[-1] # type: ignore

  duration_text = tds[2].text
  duration = timedelta(hours=int(duration_text.split(":")[0]), minutes=int(duration_text.split(":")[1]))

  rated_range_text = tds[3].text
  rated_range = RateRange.parse(rated_range_text)

  parsed = ContestInfo(start_time, contest_type, contest_name, contest_screen_name, duration, rated_range)
  logging.debug(f"{parsed=}")
  return parsed

def get_upcoming_contests():
  session = get_atcodersession()
  parsed = BeautifulSoup(session.get("/contests", params={ "lang": "en" }).text, features="html.parser")
  upcoming_div = parsed.find(id="contest-table-upcoming")
  if upcoming_div is None: raise Exception("invalid html")
  tbody = upcoming_div.find("tbody")
  if type(tbody) is not Tag: raise Exception("invalid html")
  trs: ResultSet[Tag] = tbody.find_all("tr")
  contests: List[ContestInfo] = []

  logging.debug(f"found {len(trs)} row(s)")
  for tr in trs:
    contests.append(parse_contest_row(tr))

  contests.sort(key=lambda x: x.start_time)
  return contests

def get_archived_contests():
  session = get_atcodersession()
  parsed = BeautifulSoup(session.get("/contests/archive", params={ "lang": "en" }).text, features="html.parser")

  pagination_elem = parsed.find(class_="pagination")
  if type(pagination_elem) is not Tag: raise Exception("invalid html")
  pagination_children = pagination_elem.findChildren()
  if len(pagination_children) == 0: raise Exception("invalid html")
  last_page = int(pagination_children[-2].text)

  contests: List[ContestInfo] = []

  for page in range(1, last_page + 1):
    logging.debug(f"page {page}/{last_page}")
    parsed = BeautifulSoup(session.get("/contests/archive", params={ "lang": "en", "page": page }).text, features="html.parser")
    upcoming_div = parsed.find(class_="table-responsive")
    if type(upcoming_div) is not Tag: raise Exception("invalid html")
    tbody = upcoming_div.find("tbody")
    if type(tbody) is not Tag: raise Exception("invalid html")
    trs: ResultSet[Tag] = tbody.find_all("tr")

    logging.debug(f"found {len(trs)} row(s)")
    for tr in trs:
      contests.append(parse_contest_row(tr))

  contests.sort(key=lambda x: x.start_time)
  return contests
