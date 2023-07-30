from datetime import timedelta
import os
import json
import time

from tqdm import tqdm
from subprocess import check_output, run
from runner.util import has_start_within, is_over, is_rated, is_running

RETRY_COUNT = 3
GRACE_PERIOD = 60 * 60 # 1 hour

LEVEL = ["--quiet", "--normal", "--verbose"]

repository_path: str

def get_dirty_files():
  print('[+] acquiring dirty files...')
  out = check_output(["git", "-C", repository_path, "status", "--porcelain=v1", "-uall"])
  dirty_files = [l.strip().split(maxsplit=1)[-1].decode() for l in out.strip().splitlines()]
  return dirty_files

def reset_and_clean():
  print("[+] cleaning...")
  run(["git", "-C", repository_path, "reset", "--hard"])
  run(["git", "-C", repository_path, "clean", "-fd"])

def pull():
  print("[+] syncing...")
  run(["git", "-C", repository_path, "pull"], check=True)

def commit_and_push():
  if run(["git", "-C", repository_path, "diff", "--quiet"], capture_output=True).returncode != 0:
    print("[+] commiting changes and syncing...")
    run(["git", "-C", repository_path, "add", "."])
    run(["git", "-C", repository_path, "commit", "-m", f"[auto] refresh caches"])
    run(["git", "-C", repository_path, "push", "-f"])
  else:
    print("[+] no file changed")

def update_contests():
  print("[+] updating contests...")
  for retry in range(RETRY_COUNT):
    try:
      run(["ac-predictor-crawler", LEVEL[retry], "contests"])
    except KeyboardInterrupt:
      raise KeyboardInterrupt()
    except:
      print("[*] update failed")
      continue
    break
  else:
    raise Exception("request failed")

def get_contests():
  return json.load(open(os.path.join(repository_path, "contest-details.json"), "r"))

def refresh_results():
  contests = get_contests()

  print("[+] refreshing results caches...")
  for contest in tqdm(contests):
    if not is_rated(contest) or not is_over(contest): continue
    contest_screen_name = contest["contestScreenName"]
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

def update_aperfs(contests):
  print("[+] calculating  aperfs...")
  for contest in tqdm(contests):
    if not is_rated(contest): continue
    contest_screen_name = contest["contestScreenName"]
    for retry in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", LEVEL[retry], "aperfs", "--use-results-cache", contest_screen_name], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] aperf calculation failed", contest_screen_name)
        continue
      break
    else:
      raise Exception("request failed")

def aperf_not_calculated(contest):
  return not os.path.exists(os.path.join(repository_path, f"aperfs/{contest['contestScreenName']}.json"))

def main():
  global repository_path
  repository_path = os.environ["REPOSITORY_PATH"]

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
  try:
    update_contests()
    contests = get_contests()
    update_required = [contest for contest in contests if (has_start_within(contest, timedelta(hours=5)) or is_running(contest)) and is_rated(contest)]

    print(f"[+] {len(update_required)=}")
    if any(map(aperf_not_calculated, update_required)):
      refresh_results()
      update_ratings()

    update_aperfs(update_required)
    commit_and_push()
  finally:
    reset_and_clean()
