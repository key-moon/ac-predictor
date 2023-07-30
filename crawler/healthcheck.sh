#!/bin/sh

if [ -z "$REPOSITORY_PATH" ] || [ -z "$HEALTHCHECK_UUID" ]; then
  exit 1
fi

logfile_name="/tmp/crawler-$(date '+%Y%m%d-%H%M%S').log"

ac-predictor-crawler-runner > $logfile_name 2>&1
curl -fsS -m 10 --retry 5 --data-binary "@$logfile_name" https://hc-ping.com/$HEALTHCHECK_UUID/$?

rm $logfile_name
