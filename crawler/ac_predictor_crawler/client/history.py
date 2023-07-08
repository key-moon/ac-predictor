from dataclasses import dataclass
from datetime import datetime
from typing import List, Literal
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

def _hook(obj):
  if "IsRated" not in obj: return obj
  obj["EndTime"] = datetime.strptime(obj["EndTime"], "%Y-%m-%dT%H:%M:%S%z")
  return HistoryRecord(**obj)

def get_history(user_screen_name: str, contest_type: Literal["algorithm", "heuristic"]) -> List[HistoryRecord]:
  session = get_atcodersession()
  res = session.get(f"/users/{user_screen_name}/history/json", params={ "contestType":  contest_type })
  if not res.ok:
    raise Exception(f"failed to get history ({res.reason})", user_screen_name)
  return res.json(object_hook=_hook)
