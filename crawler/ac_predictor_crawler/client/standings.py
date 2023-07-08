from ac_predictor_crawler.requests import get_atcodersession

def get_standings(contest_screen_name: str):
  session = get_atcodersession()
  session.check_logged_in()
  res = session.get(f"/contests/{contest_screen_name}/standings/json")
  if not res.ok:
    raise Exception(f"failed to get standings ({res.reason})", contest_screen_name)
  return res.json()
