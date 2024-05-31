// [start, end]
export default class Range {
  start: number
  end: number
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  contains(val: number) {
    return this.start <= val && val <= this.end;
  }

  hasValue() {
    return this.start <= this.end;
  }
}
