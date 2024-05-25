from argparse import ArgumentParser, Namespace
from ac_predictor_crawler.client.results import get_results
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository

def _initializer(parser: ArgumentParser):
  parser.add_argument("contest", action="store")

def _handler(res: Namespace):
  repo = get_repository()
  results = get_results(res.contest)
  repo.store_results(res.contest, results)

results_command = SubCommand(
  "results",
  _initializer,
  _handler,
  description="get results"
)
