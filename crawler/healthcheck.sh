#!/bin/sh

if [ -z "$REPOSITORY_PATH" ] || [ -z "$HEALTHCHECK_UUID" ]; then
  exit 1
fi

ac-predictor-crawler-runner > /tmp/crawler.log 2>&1
curl -fsS -m 10 --retry 5 --data-binary @/tmp/crawler.log https://hc-ping.com/$HEALTHCHECK_UUID/$?
