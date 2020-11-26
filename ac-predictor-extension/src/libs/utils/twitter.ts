export function GetEmbedTweetLink(content: string, url: string): string {
    return `https://twitter.com/share?text=${encodeURI(content)}&url=${encodeURI(url)}`;
}
