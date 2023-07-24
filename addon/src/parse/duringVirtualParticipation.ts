import isVirtualStandingsPage from "./isVirtualStandingsPage"

export default function duringVirtualParticipation() {
  if (!isVirtualStandingsPage()) {
    throw new Error("not available in this page");
  }
  if (document.getElementById("virtual-timer")) return true;
  else return false;
}
