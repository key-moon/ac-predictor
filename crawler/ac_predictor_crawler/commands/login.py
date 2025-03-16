import getpass
from argparse import ArgumentParser, Namespace

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.client.results import get_results
from ac_predictor_crawler.commands.subcommand import SubCommand
from ac_predictor_crawler.config import get_repository
from ac_predictor_crawler.requests import get_atcodersession

def _initializer(parser: ArgumentParser):
  parser.add_argument("user_screen_name", action="store", nargs="?")
  parser.add_argument("--session", action="store", help="Directly provide session for login")

def _handler(res: Namespace):
  if res.session:
    get_atcodersession().set_session(res.session)
    logger.info("Using provided session")
  else:
    if res.user_screen_name is None:
      user_screen_name = input("user_screen_name: ")
    else:
      user_screen_name = res.user_screen_name
    print("password:", end="")
    password = getpass.getpass()

    session = get_atcodersession()
    if session.login(user_screen_name, password):
      logger.info("login succeeded")
    else:
      logger.error("login failed")
      exit(1)

login_command = SubCommand(
  "login",
  _initializer,
  _handler,
  description="login"
)
