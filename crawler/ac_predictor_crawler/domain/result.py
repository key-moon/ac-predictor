from dataclasses import dataclass
from typing import Dict, Optional

def parse_int(s: str, default: int):
  if len(s) != 0:
    if not s.isdigit(): raise Exception("invalid format")
    return int(s)
  return default

@dataclass
class Result:
  is_rated: bool
  place: int
  old_rating: int
  new_rating: int
  performance: int
  user_screen_name: str

  inner_performance: Optional[int]

  def to_dict(self):
    res = {
      "IsRated": self.is_rated,
      "Place": self.place,
      "OldRating": self.old_rating,
      "NewRating": self.new_rating,
      "Performance": self.performance,
      "UserScreenName": self.user_screen_name,
    }
    if self.inner_performance is not None:
      res["InnerPerformance"] = self.inner_performance
    return res

  @staticmethod
  def from_dict(s: Dict):
    return Result(
      s["IsRated"],
      s["Place"],
      s["OldRating"],
      s["NewRating"],
      s["Performance"],
      s["UserScreenName"],
      s.get("InnerPerformance")
    )
