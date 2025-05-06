export default class StandingsLoadingView {
  private element: HTMLElement;
  private pendingHooks: (() => void)[];
  constructor(element: HTMLElement) {
    this.element = element;
    this.pendingHooks = [];

    new MutationObserver(() => this.resolveHooksIfPossible()).observe(this.element, { attributes: true });
  }
  onLoad(hook: () => void): void {
    if (this.isStandingsLoaded()) {
      hook();
    } else {
      this.pendingHooks.push(hook);
    }
  }
  private resolveHooksIfPossible() {
    if (this.pendingHooks.length === 0) return;
    if (!this.isStandingsLoaded()) return;
    const hooks = this.pendingHooks;
    this.pendingHooks = [];
    hooks.forEach(f => f());
  };
  private isStandingsLoaded() {
    return this.element.style.display === "none";
  }

  static Get() {
    const loadingElem = document.querySelector<HTMLElement>("#vue-standings .loading-show");
    if (loadingElem === null) {
      throw new Error("loadingElem not found");
    }
    return new StandingsLoadingView(loadingElem);
  }
}
