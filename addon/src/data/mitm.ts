type Handler = (body: string, path: string) => undefined;

const handlers: Handler[] = [];

export function addHandler(handler: Handler) {
  handlers.push(handler);
}

// absurd hack to steal ajax response data for caching
// @ts-ignore
$(document).on("ajaxComplete", (_, xhr: any, settings: any) => {
  if (xhr.status == 200) {
    for (const handler of handlers) {
      handler(xhr.responseText, settings.url);
    }
  }
});
