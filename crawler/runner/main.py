from datetime import timedelta
import os
import time
from typing import Iterable

from tqdm import tqdm
from subprocess import check_output, run

from ac_predictor_crawler.config import get_repository
from ac_predictor_crawler.repository.filerepository import FileRepository
from ac_predictor_crawler.domain.contestinfo import ContestInfo
import argparse

RETRY_COUNT = 3
GRACE_PERIOD = 60 * 60 # 1 hour

LEVEL = ["--quiet", "--normal", "--verbose"]

repository_path = os.environ["REPOSITORY_PATH"]
repository = FileRepository(repository_path)

def get_dirty_files():
  print('[+] acquiring dirty files...')
  out = check_output(["git", "-C", repository_path, "status", "--porcelain=v1", "-uall"])
  dirty_files = [l.strip().split(maxsplit=1)[-1].decode() for l in out.strip().splitlines()]
  return dirty_files

def reset_and_clean():
  print("[+] cleaning...")
  run(["git", "-C", repository_path, "reset", "--hard"], check=True)
  run(["git", "-C", repository_path, "clean", "-fd"], check=True)

def pull():
  print("[+] syncing...")
  run(["git", "-C", repository_path, "pull"], check=True)

def commit_and_push(with_rebase=True):
  if run(["git", "-C", repository_path, "diff", "--quiet"], capture_output=True).returncode != 0:
    print("[+] commiting changes and syncing...")
    run(["git", "-C", repository_path, "add", "."], check=True)
    run(["git", "-C", repository_path, "commit", "-m", f"[auto] refresh caches"], check=True)
    if with_rebase:
      run(["git", "-C", repository_path, "pull", "--rebase"], check=True)
    run(["git", "-C", repository_path, "push"] + (["-f"] if with_rebase else []), check=True)
  else:
    print("[+] no file changed")

def update_contests():
  print("[+] updating contests...")
  for retry in range(RETRY_COUNT):
    try:
      run(["ac-predictor-crawler", LEVEL[retry], "contests"], check=True)
    except KeyboardInterrupt:
      raise KeyboardInterrupt()
    except:
      print("[*] update failed")
      continue
    break
  else:
    raise Exception("request failed")

def update_results(contests: Iterable[ContestInfo]):
  print("[+] refreshing results caches...")
  for contest in tqdm(contests):
    assert contest.is_rated() and contest.is_over()
    contest_screen_name = contest.contest_screen_name
    for retry in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", LEVEL[retry], "results", contest_screen_name], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] result crawling failed", contest_screen_name)
        continue
      break
    else:
      raise Exception("request failed")

def update_ratings():
  print("[+] calculating ratings...")
  for contest_type in ["algorithm", "heuristic"]:
    for retry in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", LEVEL[retry], "ratings", "--use-results-cache", contest_type], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] rating calculation failed", contest_type)
        continue
      break
    else:
      raise Exception("request failed")

def update_aperfs(contests: Iterable[ContestInfo]):
  print("[+] calculating aperfs...")
  for contest in tqdm(contests):
    if not contest.is_rated(): continue
    for retry in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", LEVEL[retry], "aperfs", "--use-results-cache", contest.contest_screen_name], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] aperf calculation failed", contest.contest_screen_name)
        continue
      break
    else:
      raise Exception("request failed")

def init_repository():
  dirty_files = get_dirty_files()
  if dirty_files:
    print("[+] repository is dirty")
    for file in dirty_files:
      real_path = os.path.join(repository_path, file)
      last_updated = os.path.getmtime(real_path)
      elapsed = time.time() - os.path.getmtime(real_path)
      print(f"[*] {file} (last updated: {time.ctime(last_updated)}, {elapsed/60:.3f} mins ago)")
      if GRACE_PERIOD <= elapsed:
        print("[!] grace period over")
        exit(1)
    print("[+] assuming that previous job is not over")
    exit(0)

  pull()

def do_crawl_results(refresh=False):
  init_repository()

  try:
    update_contests()
    contests = filter(lambda c: c.is_rated() and c.is_over(), repository.get_contests())
    if not refresh:
      contests = filter(lambda c: not repository.has_aperfs(c.contest_screen_name), contests)
    update_results(contests)
    update_ratings()
    commit_and_push()
  finally:
    reset_and_clean()

def do_refresh_results():
  do_crawl_results(refresh=True)

def do_update_aperfs():
  init_repository()

  try:
    update_contests()
    update_required = [*filter(lambda c: (c.has_start_within(timedelta(hours=5)) or c.is_running()) and c.is_rated(), repository.get_contests())]
    print(f"[+] {len(update_required)=}")
    update_aperfs(update_required)
    commit_and_push()
  finally:
    reset_and_clean()

def main():
  parser = argparse.ArgumentParser(description="AC Predictor Crawler")
  subparsers = parser.add_subparsers(title="subcommands", dest="subcommand")

  subparsers.add_parser("crawl-results", help="Crawl and update results").set_defaults(handler=do_crawl_results)
  subparsers.add_parser("refresh-results", help="Refresh results").set_defaults(handler=do_refresh_results)
  subparsers.add_parser("update-aperfs", help="Refresh results").set_defaults(handler=do_update_aperfs)

  args = parser.parse_args()

  if hasattr(args, "handler"):
    args.handler()
  else:
    parser.print_help()
