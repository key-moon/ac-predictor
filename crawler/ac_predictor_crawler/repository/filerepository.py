from datetime import datetime, timedelta, timezone
import json
import os.path as path
from typing import List, Literal, Mapping
from venv import logger

from ac_predictor_crawler.domain.contestinfo import ContestInfo
from ac_predictor_crawler.domain.raterange import RateRange
from ac_predictor_crawler.util.file import write
from ac_predictor_crawler.logger import logger

def my_round(val: float, precision: int):
  res = round(val, precision)
  if res == round(res): return int(res)
  return res

class FileRepository:
  def __init__(self, path: str) -> None:    
    self.path = path

  def _has_file(self, relative_path: str):
    file_path = path.join(self.path, relative_path)
    logger.debug(f"check file {relative_path}")
    return path.exists(file_path)

  def _get_file(self, relative_path: str):
    file_path = path.join(self.path, relative_path)
    logger.debug(f"read file from {relative_path}")
    with open(file_path, "rb") as f:
      return f.read()

  def _save_file(self, relative_path: str, data: bytes):
    file_path = path.join(self.path, relative_path)
    logger.debug(f"write file to {file_path}")
    write(file_path, data)

  def get_contests(self) -> List[ContestInfo]:
    content = self._get_file("contest-details.json")
    def hook(obj):
      if "startTime" in obj:
        args = {}
        args["contest_name"] = obj["contestName"]
        args["contest_screen_name"] = obj["contestScreenName"]
        args["contest_type"] = obj["contestType"]
        args["start_time"] = datetime.fromtimestamp(obj["startTime"], tz=timezone.utc)
        args["duration"] = timedelta(seconds=obj["duration"])
        args["ratedrange"] = RateRange(obj["ratedrange"][0], obj["ratedrange"][1])
        return ContestInfo(**args)
      return obj

    contests = json.loads(content, object_hook=hook)
    if not (isinstance(contests, list) and all([isinstance(contest, ContestInfo) for contest in contests])):
      raise ValueError(contests)
    return contests
  def store_contests(self, contests: List[ContestInfo]):
    def hook(elem):
      if isinstance(elem, ContestInfo):
        return {
          "contestName": elem.contest_name,
          "contestScreenName": elem.contest_screen_name,
          "contestType": elem.contest_type,
          "startTime": int(elem.start_time.timestamp()),
          "duration": int(elem.duration.total_seconds()),
          "ratedrange": [elem.ratedrange.lower, elem.ratedrange.upper],
        }
      raise ValueError(elem)
    contests.sort(key=lambda x: x.start_time, reverse=True)
    self._save_file("contest-details.json", json.dumps(contests, default=hook).encode())
    # legacy
    self._save_file("contests.json", json.dumps([c.contest_screen_name for c in contests]).encode())

  def _aperfs_path(self, contest_screen_name: str):
    return f"aperfs/{contest_screen_name}.json"
  def has_aperfs(self, contest_screen_name: str):
    return self._has_file(self._aperfs_path(contest_screen_name))
  def get_aperfs(self, contest_screen_name: str):
    content = self._get_file(self._aperfs_path(contest_screen_name))
    return json.loads(content)
  def store_aperfs(self, contest_screen_name: str, aperfs: Mapping[str, float]):
    aperfs = { key: my_round(val, 2) for key, val in aperfs.items() }
    self._save_file(self._aperfs_path(contest_screen_name), json.dumps(aperfs).encode())

  def _results_path(self, contest_screen_name: str):
    return f"results/{contest_screen_name}.json"
  def has_results(self, contest_screen_name: str):
    return self._get_file(self._results_path(contest_screen_name))
  def get_results(self, contest_screen_name: str):
    content = self._get_file(self._results_path(contest_screen_name))
    return json.loads(content)
  def store_results(self, contest_screen_name: str, results):
    self._save_file(self._results_path(contest_screen_name), json.dumps(results).encode())

  def _standings_path(self, contest_screen_name: str):
    return f"standings/{contest_screen_name}.json"
  def has_standings(self, contest_screen_name: str):
    return self._has_file(self._standings_path(contest_screen_name))
  def get_standings(self, contest_screen_name: str):
    content = self._get_file(self._standings_path(contest_screen_name))
    return json.loads(content)
  def store_standings(self, contest_screen_name: str, standings):
    self._save_file(self._standings_path(contest_screen_name), json.dumps(standings).encode())

  def _ratings_path(self, contest_type: Literal["algorithm", "heuristic"]):
    return f"ratings/{contest_type}.json"
  def has_ratings(self, contest_type: Literal["algorithm", "heuristic"]):
    return self._has_file(self._ratings_path(contest_type))    
  def get_ratings(self, contest_type: Literal["algorithm", "heuristic"]):
    content = self._get_file(self._ratings_path(contest_type))
    return json.loads(content)
  def store_ratings(self, contest_type: Literal["algorithm", "heuristic"], ratings: Mapping[str, float]):
    ratings = { key: my_round(val, 2) for key, val in ratings.items() }
    self._save_file(self._ratings_path(contest_type), json.dumps(ratings).encode())
