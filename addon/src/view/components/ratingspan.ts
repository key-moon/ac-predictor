import { getColor } from "../../domain/util/rating";
import getSpan from "./span";

export default function getRatingSpan(rate: number): HTMLSpanElement {
  return getSpan([rate.toString()], ["bold", "user-" + getColor(rate)]);
}
