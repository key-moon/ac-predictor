export default function isVirtualStandingsPage() {
  return /^\/contests\/[^/]*\/standings\/virtual\/?$/.test(document.location.pathname);
}
