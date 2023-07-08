from argparse import ArgumentParser, Namespace
from ac_predictor_crawler.client.standings import get_standings
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository

def _initializer(parser: ArgumentParser):
  parser.add_argument("contest", action="store")

def _handler(res: Namespace):
  repo = get_repository()
  standings = get_standings(res.contest)
  repo.store_standings(res.contest, standings)

standings_command = SubCommand(
  "standings",
  _initializer,
  _handler,
  description="get standings"
)
