import isVirtualStandingsPage from "./isVirtualStandingsPage"

export default function duringVirtualParticipation() {
  if (!isVirtualStandingsPage()) {
    throw new Error("not available in this page");
  }
  const timerText = document.getElementById("virtual-timer")?.textContent ?? "";
  if (timerText && !timerText.includes("終了") && !timerText.includes("over")) return true;
  else return false;
}
