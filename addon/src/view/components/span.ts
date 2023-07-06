export default function getSpan(innerElements: (HTMLElement | string)[], classList: string[]): HTMLSpanElement {
  const span = document.createElement("span");
  span.append(...innerElements);
  span.classList.add(...classList);
  return span;
}
