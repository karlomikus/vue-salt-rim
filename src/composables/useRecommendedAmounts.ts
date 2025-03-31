import { ref } from 'vue';
import { unitHandler } from './useUnits';

export function useRecommendedAmounts(defaultUnit: string) {
    const defaultAmountsInMl = ['7.5', '15', '22.5', '30', '37.5', '45', '52.5', '60'];
    const defaultAmounts = ref(defaultAmountsInMl);

    if (defaultUnit === 'cl') {
        defaultAmounts.value = defaultAmountsInMl.map(amount => (parseFloat(amount) / 10).toString());
    } else if (defaultUnit === 'oz') {
        defaultAmounts.value = defaultAmountsInMl.map(amount => unitHandler.asFraction(unitHandler.ml2oz(parseFloat(amount))));
    }

    return { defaultAmounts };
}
