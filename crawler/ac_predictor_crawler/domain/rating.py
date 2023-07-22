from math import log, log2
from typing import List, Literal

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

def calc_rating(performances: List[int], contest_type: Literal["algorithm", "heuristic"]):
  if contest_type == "algorithm": return calc_algorithm_rating(performances)
  if contest_type == "heuristic": return calc_heuristic_rating(performances)
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

def calc_algorithm_rating(performances: List[int]):
  if len(performances) == 0: raise ValueError(performances)
  num, den = 0, 0
  for perf in performances:
    num = num * 0.9 + pow(2, perf / 800)
    den = den * 0.9 + 1
  return log2(num / den) * 800 - f(len(performances))

S = 724.4744301
R = 0.8271973364
def calc_heuristic_rating(performances: List[int]):
  if len(performances) == 0: raise ValueError(performances)
  qs = []
  for perf in performances:
    for i in range(1, 101):
      qs.append(perf - S * log(i))
  qs.sort(reverse=True)
  
  num, den = 0, 0
  for q in qs[100::-1]:
    num = num * R + q
    den = den * R + 1
  return num / den
