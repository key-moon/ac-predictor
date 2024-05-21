# crawler

## setup
```sh
# install
pip install -e .
# set repository path
export REPOSITORY_PATH=~/ghq/github.com/key-moon/ac-predictor-data
# login by your atcoder account
ac-predictor-crawler login
```
## usage

自動更新
```sh
# 成績表の差分更新
ac-predictor-crawler-runner crawl-results
# 成績表の全体更新
ac-predictor-crawler-runner refresh-results
# aperfs の更新
ac-predictor-crawler-runner update-aperfs
```

手動で更新
```sh
# コンテスト一覧の差分更新
ac-predictor-crawler contests
# コンテスト一覧の更新
ac-predictor-crawler contests --refresh
# 順位表を更新
ac-predictor-crawler standings [contestScreenName]
# 成績表を更新
ac-predictor-crawler results [contestScreenName]
# aperfs を計算して更新（ローカルの成績表を使用）
ac-predictor-crawler aperfs --use-results-cache [contestScreenName]
# 全員の rating を計算して更新（ローカルの成績表を使用）
ac-predictor-crawler ratings --use-results-cache [contestType]
```
