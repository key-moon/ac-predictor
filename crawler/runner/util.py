from datetime import datetime, timedelta

def is_rated(contest):
  lower, upper = contest["ratedrange"]
  return lower <= upper
def is_over(contest):
  end = datetime.fromtimestamp(contest["start_time"] + contest["duration"])
  return end <= datetime.now()
def has_start_within(contest, timedelta: timedelta):
  start = datetime.fromtimestamp(contest["start_time"])
  print(contest["contest_screen_name"], start, datetime.now())
  return datetime.now() <= start <= datetime.now() + timedelta
