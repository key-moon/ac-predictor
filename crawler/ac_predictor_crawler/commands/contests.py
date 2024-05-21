from argparse import ArgumentParser, Namespace
from datetime import timedelta, timezone
import datetime

from ac_predictor_crawler.domain.contestinfo import ContestInfo
from ac_predictor_crawler.domain.raterange import RateRange
from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.client.contests import get_archived_contests, get_upcoming_contests
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository

def _initializer(parser: ArgumentParser):
  parser.add_argument("--refresh", dest="cache", action="store_false")

def _handler(res: Namespace):
  repo = get_repository()
  if res.cache:
    try:
      logger.info("fetching contests from cache...")
      contests = repo.get_contests()
    except Exception as e:
      logger.warn(f"contests cache not found {e}")
      logger.info("fetching contests...")
      contests = get_archived_contests()
  else:
    logger.info("fetching contests...")
    contests = get_archived_contests()

  # there is a single unlisted rated contest
  if len(list(filter(lambda c: c.contest_screen_name == "jrex2017", contests))) == 0:
    contests.append(ContestInfo(
      contest_name="Japan Russia Exchange Programming Contest 2017",
      contest_screen_name="jrex2017",
      contest_type="algorithm",
      start_time=datetime.datetime(2017, 1, 21, 15, 30, tzinfo=timezone(timedelta(hours=9))),
      duration=timedelta(hours=2),
      ratedrange=RateRange.parse("All"),
    ))

  logger.info("fetching upcomings...")
  upcomings = get_upcoming_contests()
  for upcoming in upcomings:
    for duplicate_contest in filter(lambda c: c.contest_screen_name == upcoming.contest_screen_name, contests):
      contests.remove(duplicate_contest)
    contests.append(upcoming)
  contests.sort(key=lambda contest: contest.start_time)
  repo.store_contests(contests)
 

contests_command = SubCommand(
  "contests",
  _initializer,
  _handler,
  description="get contests"
)
