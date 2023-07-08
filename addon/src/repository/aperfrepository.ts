type APerfs = { [userScreenName: string]: number };

interface APerfRepository {
  getAPerfs(): Promise<APerfs>;
}

class HttpAPerfRepository {
  base: string;
  constructor(base: string) {
    this.base = base;
  }
  async getAPerfs(contestScreenName: string): Promise<APerfs> {
    return await (await fetch(new URL(`./${contestScreenName}.json`, this.base))).json();
  }
}
