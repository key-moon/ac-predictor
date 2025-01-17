import datetime
from typing import List, Mapping
from tqdm import  tqdm
from argparse import ArgumentParser, Namespace
from ac_predictor_crawler.client.results import get_results

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository
from ac_predictor_crawler.domain.rating import RatingMaterial, calc_rating, positivize_rating, to_rating_material, unpositivize_rating

def _initializer(parser: ArgumentParser):
  parser.add_argument("contest_type", choices=["algorithm", "heuristic"])
  parser.add_argument("--use-results-cache", dest="use_results_cache", action="store_true")

def _handler(res: Namespace):
  repo = get_repository()

  histories: Mapping[str, List[RatingMaterial]] = {}
  actual_ratings: Mapping[str, int] = {}

  contests = repo.get_contests()
  affective_contests = [contest for contest in contests if contest.contest_type == res.contest_type and contest.is_rated() and contest.is_over()]
  latest_contest_date = max(contest.end_time for contest in affective_contests) # TODO: 更新日は別の可能性がある

  logger.debug(f'{len(affective_contests)=}')
  logger.info("gathering histories from results...")
  for contest in tqdm(sorted(affective_contests, key=lambda contest: contest.start_time)):
    if res.use_results_cache:
      results = repo.get_results(contest.contest_screen_name)
    else:
      results = get_results(contest.contest_screen_name)
    for result in results:
      if not result.is_rated: continue
      if result.user_screen_name not in histories: histories[result.user_screen_name] = []
      histories[result.user_screen_name].append(to_rating_material(result.performance, contest, latest_contest_date))
      actual_ratings[result.user_screen_name] = result.new_rating

  logger.info("computing ratings from histories...")
  ratings = {}
  for user_screen_name in list(histories.keys()):
    ratings[user_screen_name] = calc_rating(histories[user_screen_name], res.contest_type)
    if actual_ratings[user_screen_name] != round(positivize_rating(ratings[user_screen_name])):
      logger.warn(f"computed ratings of the user {user_screen_name} does not match (computed: {positivize_rating(ratings[user_screen_name]):.6}, actual: {actual_ratings[user_screen_name]}, history: {histories[user_screen_name]})")
      ratings[user_screen_name] = unpositivize_rating(actual_ratings[user_screen_name])
    del histories[user_screen_name]

  repo.store_ratings(res.contest_type, ratings)

ratings_command = SubCommand(
  "ratings",
  _initializer,
  _handler,
  description="get ratings"
)
