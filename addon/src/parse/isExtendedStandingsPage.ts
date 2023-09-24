export default function isExtendedStandingsPage() {
  return /^\/contests\/[^/]*\/standings\/extended\/?$/.test(document.location.pathname);
}
