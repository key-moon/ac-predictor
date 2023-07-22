export default function isStandingsPage() {
  return /^\/contests\/[^/]*\/standings/.test(document.location.pathname);
}
