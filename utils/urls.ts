const URL_PATTERN = /https?:\/\/[^\s]+/g;
const TRAILING_PUNCTUATION = /[.,;:!?'")\]]+$/;

// Raw substrings matched by the URL pattern, unmodified. Useful when the
// caller needs to find-and-remove the exact text that appeared in the source string.
export function matchUrls(text: string): string[] {
    return text.match(URL_PATTERN) ?? [];
}

// Matched URLs with trailing punctuation (picked up from surrounding prose,
// e.g. a URL at the end of a sentence) stripped, so they're safe to fetch or store.
export function extractUrls(text: string): string[] {
    return matchUrls(text).map(url => url.replace(TRAILING_PUNCTUATION, ''));
}
