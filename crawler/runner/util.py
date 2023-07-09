from datetime import datetime, timedelta, timezone

def is_rated(contest):
  lower, upper = contest["ratedrange"]
  return lower <= upper
def is_over(contest):
  end = datetime.fromtimestamp(contest["start_time"] + contest["duration"])
  return end <= datetime.now()
def has_start_within(contest, timedelta: timedelta):
  start = datetime.fromtimestamp(contest["start_time"])
  return datetime.now() <= start <= datetime.now() + timedelta
def is_running(contest):
  start = datetime.fromtimestamp(contest["start_time"])
  end = datetime.fromtimestamp(contest["start_time"] + contest["duration"])
  return start <= datetime.now() <= end
