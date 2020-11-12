/**
 *
 * @param {string} [content]
 * @param {string} [url]
 * @return {string}
 */
export function GetEmbedTweetLink(content, url) {
    return `https://twitter.com/share?text=${encodeURI(
        content
    )}&url=${encodeURI(url)}`;
}
