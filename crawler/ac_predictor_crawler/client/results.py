from ac_predictor_crawler.domain.result import Result
from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.requests import get_atcodersession

def get_results(contest_screen_name: str):
  session = get_atcodersession()
  res = session.get(f"/contests/{contest_screen_name}/results/json")
  if not res.ok:
    logger.error(f"failed to get results ({res.reason}), {contest_screen_name=}")
    exit(1)
  return list(map(Result.from_dict, res.json()))
