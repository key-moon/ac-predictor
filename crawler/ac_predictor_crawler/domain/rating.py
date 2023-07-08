from math import log
from typing import List

def unpositivize_rating(rating: float):
  if rating >= 400: return rating
  print(rating)
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
