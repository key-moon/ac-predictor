import logging
import os
from argparse import ArgumentParser
from ac_predictor_crawler.logger import logger

from ac_predictor_crawler.config import set_repository, set_session_path, set_should_store
from ac_predictor_crawler.requests import init_atcodersession, save_atcodersession
from ac_predictor_crawler.repository.filerepository import FileRepository

from ac_predictor_crawler.commands.subcommand import register_subcommands
from ac_predictor_crawler.commands.contests import contests_command
from ac_predictor_crawler.commands.results import results_command
from ac_predictor_crawler.commands.standings import standings_command
from ac_predictor_crawler.commands.aperf import aperfs_command
from ac_predictor_crawler.commands.login import login_command
from ac_predictor_crawler.commands.ratings import ratings_command


SESSION_PATH_KEY = "SESSION_PATH"
REPOSITORY_PATH_KEY = "REPOSITORY_PATH"

def main():
  global INDEXING, repository

  parser = ArgumentParser("ac-predictor-crawler")
  parser.add_argument("--quiet", action="store_true")
  parser.add_argument("--normal", action="store_true")
  parser.add_argument("--verbose", action="store_true")
  parser.add_argument("--no-store", dest="store", action="store_false")

  parser.add_argument("--repository-path", action="store")

  register_subcommands(
    parser,
    [
      contests_command,
      results_command,
      standings_command,
      aperfs_command,
      # TODO: users_command
      login_command,
      ratings_command
    ]
  )

  args = parser.parse_args()

  logger.setLevel(logging.DEBUG if args.verbose else logging.WARN if args.quiet else logging.INFO)

  session_path = os.path.expanduser(os.environ.get(SESSION_PATH_KEY, "~/.config/ac-predictor-crawler/session.txt"))
  set_session_path(session_path)
  init_atcodersession()

  if args.repository_path is not None:
    set_repository(FileRepository(args.repository_path))
  else:
    set_repository(FileRepository(os.environ[REPOSITORY_PATH_KEY]))

  set_should_store(args.store)
  
  if hasattr(args, "handler"):
    args.handler(args)
  else:
    parser.print_help()
  
  save_atcodersession()

if __name__ == "__main__":
  main()
