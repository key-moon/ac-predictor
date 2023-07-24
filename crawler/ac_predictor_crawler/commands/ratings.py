from typing import List, Mapping
from tqdm import  tqdm
from argparse import ArgumentParser, Namespace
from ac_predictor_crawler.client.history import get_history
from ac_predictor_crawler.client.results import get_results

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.client.standings import get_standings
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository
from ac_predictor_crawler.domain.rating import calc_aperf, calc_rating

def _initializer(parser: ArgumentParser):
  parser.add_argument("contest_type", choices=["algorithm", "heuristic"])
  parser.add_argument("--use-results-cache", dest="use_results_cache", action="store_true")

def _handler(res: Namespace):
  repo = get_repository()

  histories: Mapping[str, List[int]] = {}
  
  contests = repo.get_contests()
  affective_contests = [contest for contest in contests if contest.contest_type == res.contest_type and contest.is_rated() and not contest.is_over()]
  logger.debug(f'{len(affective_contests)=}')
  logger.info(f"gathering histories from results...")
  for contest in tqdm(sorted(affective_contests, key=lambda contest: contest.start_time)):
    if res.use_results_cache:
      results = repo.get_results(contest.contest_screen_name)
    else:
      results = get_results(contest.contest_screen_name)
    for result in results:
      if not result["IsRated"]: continue
      user_screen_name = result["UserScreenName"]
      if user_screen_name not in histories: histories[user_screen_name] = []
      histories[user_screen_name].append(result["Performance"])

  logger.info(f"gathering histories from results...")
  ratings = ({ key: calc_rating(history, res.contest_type) for key, history in histories.items() })
  repo.store_ratings(ratings)

ratings_command = SubCommand(
  "ratings",
  _initializer,
  _handler,
  description="get ratings"
)
