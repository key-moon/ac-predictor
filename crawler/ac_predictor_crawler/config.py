from ac_predictor_crawler.repository.filerepository import FileRepository

def get_atcoder_base_url():
  return "https://atcoder.jp"

_repository: FileRepository
def set_repository(repository: FileRepository):
  global _repository
  _repository = repository
def get_repository():
  return _repository

_should_store: bool
def set_should_store(should_store: bool):
  global _should_store
  _should_store = should_store
def should_store():
  return _should_store

_interval: float
def set_interval(interval: float):
  global _interval
  _interval = interval

def get_interval():
  return _interval

_session_path: str
def set_session_path(session_path: str):
  global _session_path
  _session_path = session_path
def get_session_path():
  return _session_path
