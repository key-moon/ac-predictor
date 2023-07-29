import { getConfig } from "./config";

const isDebug = location.hash.includes("ac-predictor-debug") || getConfig("isDebug");
export default function isDebugMode() {
  return isDebug;
}
