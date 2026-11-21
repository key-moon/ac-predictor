from dataclasses import dataclass, fields
from datetime import datetime, timezone
from typing import List, Literal
from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.requests import get_atcodersession

@dataclass
class HistoryRecord:
  IsRated: bool
  Place: int
  OldRating: int
  NewRating: int
  Performance: int
  InnerPerformance: int
  ContestScreenName: str
  ContestName: str
  ContestNameEn: str
  EndTime: datetime

_HISTORY_FIELDS = {field.name for field in fields(HistoryRecord)}

def _hook(obj):
  if "IsRated" not in obj: return obj
  obj["EndTime"] = datetime.strptime(obj["EndTime"], "%Y-%m-%dT%H:%M:%S%z")
  # AtCoder may add fields to the history API without notice (e.g. StartTime,
  # Division). Ignore unknown fields instead of passing them to the dataclass.
  return HistoryRecord(**{key: value for key, value in obj.items() if key in _HISTORY_FIELDS})

def get_history(user_screen_name: str, contest_type: Literal["algorithm", "heuristic"]) -> List[HistoryRecord]:
  session = get_atcodersession()
  res = session.get(f"/users/{user_screen_name}/history/json", params={ "contestType":  contest_type })
  if not res.ok:
    logger.error(f"failed to get history ({res.reason}), {user_screen_name=}")
    exit(1)
  return res.json(object_hook=_hook)
