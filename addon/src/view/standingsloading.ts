export default class StandingsLoadingView {
  private loaded: boolean;
  private element: HTMLElement;
  private hooks: (() => void)[];
  constructor(element: HTMLElement) {
    this.loaded = false;
    this.element = element;
    this.hooks = [];
    this.initHandler();
  }
  onLoad(hook: () => void): void {
    this.hooks.push(hook);
  }
  private initHandler() {
    new MutationObserver(() => {
      if (!this.loaded) {
        if (document.getElementById("standings-tbody") === null) return;
        this.loaded = true;
        this.hooks.forEach(f => f());
      }
    }).observe(this.element, { attributes: true });    
  }

  static Get() {
    const loadingElem = document.querySelector<HTMLElement>("#vue-standings .loading-show");
    if (loadingElem === null) {
      throw new Error("loadingElem not found");
    }
    return new StandingsLoadingView(loadingElem);
  }
}
