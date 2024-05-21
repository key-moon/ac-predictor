
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from typing import Literal

from ac_predictor_crawler.domain.raterange import RateRange

@dataclass
class ContestInfo:
  start_time: datetime
  contest_type: Literal["algorithm", "heuristic"]
  contest_name: str
  contest_screen_name: str
  duration: timedelta
  ratedrange: RateRange
  def is_rated(self):
    return self.ratedrange.has_value()
  def has_start_within(self, timedelta: timedelta):
    return datetime.now(timezone.utc) <= self.start_time <= datetime.now(timezone.utc) + timedelta
  def is_running(self):
    return self.start_time <= datetime.now(timezone.utc) <= self.start_time + self.duration
  def is_over(self):
    return self.start_time + self.duration <= datetime.now(timezone.utc)
