from dataclasses import dataclass

def parse_int(s: str, default: int):
  if len(s) != 0:
    if not s.isdigit(): raise Exception("invalid format")
    return int(s)
  return default

@dataclass
class RateRange:
  lower: int
  upper: int
  def has_value(self):
    return self.lower <= self.upper

  @staticmethod
  def parse(s: str):
    s = s.strip()
    if s == "All":
      return RateRange(-10000, 10000)
    if s == "-":
      return RateRange(1, 0)
    splitted = s.split("-")
    if len(splitted) != 2: raise Exception("invalid format")
    return RateRange(parse_int(splitted[0].strip(), -10000), parse_int(splitted[1].strip(), 10000))
