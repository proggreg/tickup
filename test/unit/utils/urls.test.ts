import { describe, expect, it } from 'vitest';
import { extractUrls, matchUrls } from '../../../utils/urls';

describe('extractUrls', () => {
    it('strips trailing punctuation picked up from surrounding prose', () => {
        const text = 'The strategy could not generate a response for \'http://localhost:3000/list/328\'.';

        expect(extractUrls(text)).toEqual(['http://localhost:3000/list/328']);
    });

    it('returns a bare url unchanged', () => {
        const text = 'Check out https://example.com/page for details';

        expect(extractUrls(text)).toEqual(['https://example.com/page']);
    });

    it('returns an empty array when there is no url', () => {
        expect(extractUrls('no links here')).toEqual([]);
    });

    it('strips multiple trailing punctuation characters', () => {
        expect(extractUrls('See (https://example.com).')).toEqual(['https://example.com']);
    });
});

describe('matchUrls', () => {
    it('returns the raw matched substrings, punctuation included', () => {
        const text = 'for \'http://localhost:3000/list/328\'.';

        expect(matchUrls(text)).toEqual(['http://localhost:3000/list/328\'.']);
    });
});
