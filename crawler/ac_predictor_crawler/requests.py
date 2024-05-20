import os
import time

from datetime import timedelta, datetime
from typing import Optional
from requests import Session
from urllib.parse import urljoin

from ac_predictor_crawler.logger import logger
from ac_predictor_crawler.util.file import write
from ac_predictor_crawler.config import get_atcoder_base_url, get_interval, get_session_path

class AtCoderSession(Session):
  def __init__(self, base_url: Optional[str]=None, interval=timedelta(seconds=2)):
    super().__init__()
    if base_url is None: base_url = get_atcoder_base_url()
    self.base_url = base_url
    self.interval = interval
    self.csrf_token: Optional[str] = None
    self.user_screen_name: Optional[str] = None
    self.last_request = datetime.now()

  def request(self, method, url, *args, **kwargs):
    self._wait_interval()

    joined_url = urljoin(self.base_url, url)
    logger.debug(f"requests to {joined_url}")
    res = super().request(method, joined_url, *args, **kwargs)
    self._update_session_info(res.text)

    return res

  def set_session(self, revel_session: str):
    self.cookies.set("REVEL_SESSION", revel_session, domain="atcoder.jp", path="/", secure=True)
  def get_session(self):
    return _session.cookies.get("REVEL_SESSION", domain="atcoder.jp", path="/")

  def login(self, user_name: str, password: str):
    self._ensure_session_info()
    content = {
      "username": user_name,
      "password": password,
      "csrf_token": self.csrf_token
    }
    res = self.post("/login", data=content)
    return res.status_code == 200

  def check_logged_in(self):
    self._ensure_session_info()
    if self.user_screen_name is None or self.user_screen_name == "":
      logger.error("not logged in")
      exit(1)

  def _wait_interval(self):
    wait = max(((self.last_request + self.interval) - datetime.now()).total_seconds(), 0)
    logger.debug(f"waiting {wait} secs...")
    time.sleep(wait)
    self.last_request = datetime.now()

  def _ensure_session_info(self):
    if self.csrf_token is None:
      self.get("/")
      assert self.csrf_token is not None

  def _update_session_info(self, body: str):
    def get_js_variable(name: str):
      import re
      match = re.search(rf"var {name} = \"(.*)\"", body)
      if match is None: return None
      return match.group(1)
    self.csrf_token = get_js_variable("csrfToken")
    self.user_screen_name = get_js_variable("userScreenName")
    logger.debug(f"session updated. user: {self.user_screen_name}")

_session: AtCoderSession
def init_atcodersession():
  global _session
  _session = AtCoderSession(interval=timedelta(seconds=get_interval()))
  if os.path.exists(get_session_path()):
    _session.set_session(open(get_session_path(), "r").read())

def get_atcodersession():
  return _session

def save_atcodersession():
  write(get_session_path(), _session.get_session())
