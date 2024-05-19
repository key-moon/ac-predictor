from typing import List, Mapping
from tqdm import  tqdm
from argparse import ArgumentParser, Namespace
from ac_predictor_crawler.client.history import get_history
from ac_predictor_crawler.client.results import get_results

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.client.standings import get_standings
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository
from ac_predictor_crawler.domain.rating import calc_aperf

def _initializer(parser: ArgumentParser):
  parser.add_argument("contest", action="store")
  parser.add_argument("--refresh", dest="use_aperf_cache", action="store_false")
  parser.add_argument("--use-standings-cache", dest="use_standings_cache", action="store_true")
  parser.add_argument("--use-results-cache", dest="use_results_cache", action="store_true")

def _handler(res: Namespace):
  repo = get_repository()
  contest_screen_name = res.contest

  if res.use_standings_cache:
    standings = repo.get_standings(contest_screen_name)
  else:
    standings = get_standings(contest_screen_name)

  if res.use_aperf_cache:
    try:
      aperfs = repo.get_aperfs(contest_screen_name)
    except:
      logger.warn("aperfs cache not found")
      aperfs = {}
  else:
    aperfs = {}

  contests = repo.get_contests()
  this_info = [contest for contest in contests if contest.contest_screen_name == contest_screen_name][0]
  histories: Mapping[str, List[int]] = {}

  BOUND_PERFORMANCE = [1200 + 400, 2000 + 400, 2800 + 400]
  inaccurate_users = set()

  affective_contests = [contest for contest in contests if contest.contest_type == this_info.contest_type and contest.is_rated() and contest.start_time < this_info.start_time]
  logger.debug(f'{len(affective_contests)=}')
  missing_users = set([data["UserScreenName"] for data in standings["StandingsData"] if data["IsRated"] and data["UserScreenName"] not in aperfs])
  logger.debug(f'{len(missing_users)=}')
  logger.info(f"gathering histories from results...")
  for contest in tqdm(sorted(affective_contests, key=lambda contest: contest.start_time)):
    if res.use_results_cache:
      results = repo.get_results(contest.contest_screen_name)
    else:
      results = get_results(contest.contest_screen_name)
    for result in results:
      if not result["IsRated"]: continue
      user_screen_name = result["UserScreenName"]
      if user_screen_name not in missing_users: continue
      if user_screen_name not in histories: histories[user_screen_name] = []

      if result["Performance"] in BOUND_PERFORMANCE:
        inaccurate_users.add(user_screen_name)
      histories[user_screen_name].append(result["Performance"])

  for user in inaccurate_users:
    del histories[user]

  missing_users.difference_update(histories.keys())
  logger.info(f"gathering histories...")

  history_required = []
  for standingsData in tqdm(standings["StandingsData"]):
    user_screen_name = standingsData["UserScreenName"]
    if user_screen_name not in missing_users: continue
    if standingsData["UserIsDeleted"]: continue
    if standingsData["Competitions"] == 0: continue
    history_required.append(user_screen_name)

  for user_screen_name in tqdm(history_required):    
    history = get_history(user_screen_name, this_info.contest_type)
    
    valid_contests = [record for record in history if record.IsRated and record.EndTime < this_info.start_time]
    if len(valid_contests) == 0: continue
    valid_contests.sort(key=lambda x: x.EndTime)
    histories[user_screen_name] = list(map(lambda x: x.InnerPerformance, valid_contests))

  logger.info(f"gathering histories from results...")
  aperfs.update({ key: calc_aperf(history) for key, history in histories.items() })
  repo.store_aperfs(contest_screen_name, aperfs)

aperfs_command = SubCommand(
  "aperfs",
  _initializer,
  _handler,
  description="get aperfs"
)
