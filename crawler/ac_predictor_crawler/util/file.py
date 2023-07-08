import os
from typing import Union

def write(path: str, content: Union[str, bytes]):
  os.makedirs(os.path.dirname(path), exist_ok=True)
  if isinstance(content, bytes):
    open(path, "wb").write(content)
  if isinstance(content, str):
    open(path, "w").write(content)
  