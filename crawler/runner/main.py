from datetime import timedelta
import os
import json

from tqdm import tqdm
from subprocess import run
from runner.util import has_start_within, is_over, is_rated

RETRY_COUNT = 3

repository_path: str

def clean_and_pull():
  print("[+] cleaning and syncing...")
  run(["git", "-C", repository_path, "reset", "--hard"])
  run(["git", "-C", repository_path, "clean", "-fd"])
  run(["git", "-C", repository_path, "pull", "-f"])

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
  run(["ac-predictor-crawler", "--quiet", "contests"])

def get_contests():
  return json.load(open(os.path.join(repository_path, "contest-details.json"), "r"))

def refresh_results():
  contests = get_contests()

  print("[+] refreshing results caches...")
  for contest in tqdm(contests):
    if not is_rated(contest) or not is_over(contest): continue
    contest_screen_name = contest["contest_screen_name"]
    for _ in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", "--quiet", "results", contest_screen_name], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] result crawling failed", contest_screen_name)
        continue
      break
    else:
      raise Exception("request failed")

def update_aperfs(contests):
  print("[+] calculating  aperfs...")
  for contest in tqdm(contests):
    if not is_rated(contest): continue
    contest_screen_name = contest["contest_screen_name"]
    for _ in range(RETRY_COUNT):
      try:
        run(["ac-predictor-crawler", "--quiet", "aperfs", "--use-results-cache", contest_screen_name], check=True)
      except KeyboardInterrupt:
        raise KeyboardInterrupt()
      except:
        print("[*] aperf calculation failed", contest_screen_name)
        continue
      break
    else:
      raise Exception("request failed")
    

def aperf_not_calculated(contest):
  return not os.path.exists(os.path.join(repository_path, f"results/{contest['contest_screen_name']}.json"))
def main():
  global repository_path
  repository_path = os.environ["REPOSITORY_PATH"]

  clean_and_pull()
  update_contests()
  
  contests = get_contests()
  update_required = [contest for contest in contests if has_start_within(contest, timedelta(hours=25))]
  print(f"[+] {len(update_required)=}")
  if any(map(aperf_not_calculated, update_required)):
    refresh_results()
  update_aperfs(update_required)

  commit_and_push()
