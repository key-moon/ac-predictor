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
    if (this.loaded) {
      hook();
    } else {
      this.hooks.push(hook);
    }
  }
  private initHandler() {
    const execute = () => {
      if (!this.loaded) {
        if (document.getElementById("standings-tbody") === null) return;
        this.loaded = true;
        this.hooks.forEach(f => f());
      }
    };
    if (this.element.style.display === "none") {
      execute();
    } else {
      new MutationObserver(execute).observe(this.element, { attributes: true });
    }
  }

  static Get() {
    const loadingElem = document.querySelector<HTMLElement>("#vue-standings .loading-show");
    if (loadingElem === null) {
      throw new Error("loadingElem not found");
    }
    return new StandingsLoadingView(loadingElem);
  }
}
