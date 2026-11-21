import json
import unittest
from datetime import datetime, timedelta, timezone

from ac_predictor_crawler.client.history import HistoryRecord, _hook


class HistoryHookTest(unittest.TestCase):
  def test_ignores_fields_not_declared_on_history_record(self):
    payload = {
      "IsRated": True,
      "Place": 1,
      "OldRating": 1200,
      "NewRating": 1300,
      "Performance": 1500,
      "InnerPerformance": 1500,
      "ContestScreenName": "abc485.contest.atcoder.jp",
      "ContestName": "AtCoder Beginner Contest 485",
      "ContestNameEn": "",
      "StartTime": "2026-11-21T21:00:00+09:00",
      "EndTime": "2026-11-21T22:40:00+09:00",
      "Division": 0,
      "SomeFutureField": "ignored",
    }

    record = json.loads(json.dumps(payload), object_hook=_hook)

    self.assertIsInstance(record, HistoryRecord)
    self.assertEqual(record.NewRating, 1300)
    self.assertEqual(
      record.EndTime,
      datetime(2026, 11, 21, 22, 40, tzinfo=timezone(timedelta(hours=9))),
    )

  def test_non_history_object_is_returned_unchanged(self):
    self.assertEqual(_hook({"foo": "bar"}), {"foo": "bar"})


if __name__ == "__main__":
  unittest.main()
