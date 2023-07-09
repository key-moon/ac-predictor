import logging

END = "\033[0m"
BOLD = "\033[1m"

BANNER = {
  "DEBUG": ("", "[-]"),
  "INFO":  ("\033[32m", "[*]"), # Green
  "WARNING":  ("\033[33m", "[+]"), # Yellow
  "ERROR": ("\033[31m", "[!]"), # Red
  "CRITICAL": ("\033[35m", "CRITICAL: "), # Purple
}

class ColoredFormatter(logging.Formatter):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.fmt = self._get_fmt()

  def _get_fmt(self):
    import re
    pattern = re.compile(r"\x1b\[[0-9;]*m")
    return pattern.sub("", self._style._fmt)

  def format(self, record: logging.LogRecord):
    color, prefix = BANNER[record.levelname]
    return f'{color}{BOLD}{prefix}{END} {color}{super().format(record)}{END}'

handler = logging.StreamHandler()
handler.setFormatter(ColoredFormatter("%(funcName)s: %(message)s"))

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(handler)
