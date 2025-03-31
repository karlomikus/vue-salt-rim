import { describe, it, expect } from 'vitest';
import { useHtmlDecode } from '../useHtmlDecode';

describe('useHtmlDecode', () => {
    it('decodes a valid HTML-encoded string', () => {
        const input = '&amp;';
        const result = useHtmlDecode(input);
        expect(result).toBe('&');
    });

    it('returns an empty string when input is empty', () => {
        const input = '';
        const result = useHtmlDecode(input);
        expect(result).toBe('');
    });

    it('returns the same string if there are no HTML entities', () => {
        const input = 'Hello, world!';
        const result = useHtmlDecode(input);
        expect(result).toBe('Hello, world!');
    });

    it('decodes a string with multiple HTML entities', () => {
        const input = '&lt;div&gt;Hello &amp; welcome!&lt;/div&gt;';
        const result = useHtmlDecode(input);
        expect(result).toBe('<div>Hello & welcome!</div>');
    });

    it('handles unsupported or invalid HTML entities gracefully', () => {
        const input = '&unknown;';
        const result = useHtmlDecode(input);
        expect(result).toBe('&unknown;');
    });
});
