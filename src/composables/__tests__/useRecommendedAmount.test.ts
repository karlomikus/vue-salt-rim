import { describe, it, expect } from 'vitest';
import { useRecommendedAmounts } from './../useRecommendedAmounts';

describe('useRecommendedAmounts', () => {
    it('returns default amounts in ml when default unit is ml', () => {
        const { defaultAmounts } = useRecommendedAmounts('ml');
        expect(defaultAmounts.value).toEqual(['7.5', '15', '22.5', '30', '37.5', '45', '52.5', '60']);
    });

    it('converts default amounts to cl when default unit is cl', () => {
        const { defaultAmounts } = useRecommendedAmounts('cl');
        expect(defaultAmounts.value).toEqual(['0.75', '1.5', '2.25', '3', '3.75', '4.5', '5.25', '6']);
    });

    it('converts default amounts to oz as fractions when default unit is oz', () => {
        const { defaultAmounts } = useRecommendedAmounts('oz');
        const expectedAmounts = ['1/4', '1/2', '3/4', '1', '1 1/4', '1 1/2', '1 3/4', '2'];
        expect(defaultAmounts.value).toEqual(expectedAmounts);
    });

    it('handles an empty default unit gracefully', () => {
        const { defaultAmounts } = useRecommendedAmounts('');
        expect(defaultAmounts.value).toEqual(['7.5', '15', '22.5', '30', '37.5', '45', '52.5', '60']);
    });

    it('handles an unsupported default unit gracefully', () => {
        const { defaultAmounts } = useRecommendedAmounts('unsupported');
        expect(defaultAmounts.value).toEqual(['7.5', '15', '22.5', '30', '37.5', '45', '52.5', '60']);
    });
});
