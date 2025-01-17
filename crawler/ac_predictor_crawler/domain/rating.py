from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from math import exp, log, log2
from typing import List, Literal

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.domain.contestinfo import ContestInfo

def positivize_rating(rating: float):
  if rating >= 400: return rating
  return 400.0 * exp((rating - 400.0) / 400.0)

def unpositivize_rating(rating: float):
  if rating >= 400: return rating
  return 400.0 + 400.0 * log(rating / 400.0)

def calc_aperf(performances: List[int]):
  """
  performance: old -> new
  """
  if len(performances) == 0: raise ValueError(performances)
  den, num = 0, 0
  for perf in performances:
    den = den * 0.9 + perf
    num = num * 0.9 + 1
  return den / num

@dataclass
class RatingMaterial:
  performance: int
  weight: float
  days_from_latest_contest: int

def to_rating_material(performance: int, contest: ContestInfo, latest_contest_date: datetime):
  def to_utc_date(date: datetime):
    epoch = datetime(1970, 1, 1, 0, 0, tzinfo=timezone(timedelta(hours=-9)))
    return int((date - epoch).total_seconds()) // (24 * 60 * 60)

  if contest.end_time < datetime(2025, 1, 1, tzinfo=timezone(timedelta(hours=-9))):
    weight = 1
  elif contest.end_time < datetime(2026, 1, 1, tzinfo=timezone(timedelta(hours=-9))):
    if contest.duration < timedelta(1):
      weight = 0.5
    else:
      weight = 1
  else:
    logger.warning("weighting of the contest after 2026 might be wrong")
    if contest.duration < timedelta(1):
      weight = 0.5
    else:
      weight = 1

  return RatingMaterial(performance, weight, to_utc_date(latest_contest_date) - to_utc_date(contest.end_time))

def calc_rating(materials: List[RatingMaterial], contest_type: Literal["algorithm", "heuristic"]):
  if contest_type == "algorithm": return calc_algorithm_rating(materials)
  if contest_type == "heuristic": return calc_heuristic_rating(materials)
  raise ValueError(contest_type)

def F(n):
  num, den = 0, 0
  for i in range(1,n+1):
    num = (num + 1) * 0.81
    den = (den + 1) * 0.9
  num = num**0.5
  return num / den
F1 = F(1)
FInf = F(10000)
def f(n):
  return (F(n) - FInf) / (F(1) - FInf) * 1200

def calc_algorithm_rating(materials: List[RatingMaterial]):
  if len(materials) == 0: raise ValueError(materials)
  num, den = 0, 0
  for material in materials:
    num = num * 0.9 + pow(2, material.performance / 800)
    den = den * 0.9 + 1
  return log2(num / den) * 800 - f(len(materials))

S = 724.4744301
R = 0.8271973364
def calc_heuristic_rating(materials: List[RatingMaterial]):
  if len(materials) == 0: raise ValueError(materials)
  qs = []
  for material in materials:
    adjusted_performance = material.performance + 150 - 100 * material.days_from_latest_contest / 365
    for i in range(1, 101):
      qs.append((adjusted_performance - S * log(i), material.weight))
  qs.sort(reverse=True)
  
  r = 0
  s = 0
  for q, w in qs:
    s += w
    r += q * (R**(s - w) - R**s)
  return r
