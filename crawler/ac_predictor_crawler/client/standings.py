from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.requests import get_atcodersession

def get_standings(contest_screen_name: str):
  session = get_atcodersession()
  res = session.get(f"/contests/{contest_screen_name}/standings/json")
  session.check_logged_in()
  if not res.ok:
    logger.error(f"failed to get standings ({res.reason}), {contest_screen_name=}")
    exit(1)
  return res.json()
