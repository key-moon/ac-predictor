import { getConfig } from "./config";

export default function isDebugMode() {
  return location.hash.includes("ac-predictor-debug") || getConfig("isDebug");
}
