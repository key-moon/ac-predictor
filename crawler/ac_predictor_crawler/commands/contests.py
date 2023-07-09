from argparse import ArgumentParser, Namespace

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.client.contests import get_archived_contests, get_upcoming_contests
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository

def _initializer(parser: ArgumentParser):
  parser.add_argument("--refresh", dest="cache", action="store_false")

def _handler(res: Namespace):
  repo = get_repository()
  if res.cache:
    try:
      logger.info("fetching contests from cache...")
      contests = repo.get_contests()
    except:
      logger.warn("contests cache not found")
      logger.info("fetching contests...")
      contests = get_archived_contests()
  else:
    logger.info("fetching contests...")
    contests = get_archived_contests()

  logger.info("fetching upcomings...")
  upcomings = get_upcoming_contests()
  for upcoming in upcomings:
    if any([c.contest_screen_name == upcoming.contest_screen_name for c in contests]):
      continue
    contests.append(upcoming)
  repo.store_contests(contests)
 

contests_command = SubCommand(
  "contests",
  _initializer,
  _handler,
  description="get contests"
)
