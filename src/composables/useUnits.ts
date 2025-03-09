import { numericQuantity } from 'numeric-quantity';
import { formatQuantity } from 'format-quantity';

export interface UnitIngredient {
    amount: number|string|null;
    amount_max?: number|string|null;
    units?: string|null;
}

const unitHandler = {
    print(ingredient: UnitIngredient, convertTo: string = 'ml', scaleFactor: number = 1): string {
        let orgAmount = 0
        if (ingredient.amount !== null && ingredient.amount !== undefined) {
            orgAmount = numericQuantity(`${ingredient.amount}`)
        }

        let orgAmountMax = 0
        if (ingredient.amount_max !== null && ingredient.amount_max !== undefined) {
            orgAmountMax = numericQuantity(`${(ingredient.amount_max || 0)}`)
        }

        orgAmount *= scaleFactor
        orgAmountMax *= scaleFactor

        const orgUnits = ingredient.units ? ingredient.units.toLowerCase() : ''

        // Don't convert unconvertable units
        if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
            return `${orgAmount == 0 ? '' : this.toFixedWithTruncate(orgAmount, 3)}${orgAmountMax != 0 ? '-' + this.toFixedWithTruncate(orgAmountMax, 3) : ''} ${orgUnits}`
        }

        let minAmount: string|number = this.convertFromTo(orgUnits, orgAmount, convertTo)
        let maxAmount: string|number = this.convertFromTo(orgUnits, orgAmountMax, convertTo)

        minAmount = this.toFixedWithTruncate(minAmount, 3)
        maxAmount = this.toFixedWithTruncate(maxAmount, 3)

        if (convertTo == 'oz') {
            minAmount = this.asFraction(minAmount)
            maxAmount = this.asFraction(maxAmount)
        }

        return `${minAmount == 0 ? '0' : minAmount}${maxAmount != 0 ? '-' + maxAmount : ''} ${convertTo}`
    },

    asFraction(number: number|string): string {
        return formatQuantity(number) ?? ''
    },

    asDecimal(fraction: string): number {
        return numericQuantity(fraction)
    },

    convertFromTo(fromUnits: string, amount: number, toUnits: string): number {
        const conversionMap: Record<string, (amount: number) => number> = {
            'ml->oz': this.ml2oz,
            'ml->cl': this.ml2cl,
            'oz->ml': this.oz2ml,
            'oz->cl': this.oz2cl,
            'cl->ml': this.cl2ml,
            'cl->oz': this.cl2oz,
        }

        const conversionKey = `${fromUnits}->${toUnits}`
        const conversionFunction = conversionMap[conversionKey]

        if (conversionFunction) {
            return conversionFunction(amount)
        }
    
        return amount
    },

    toFixedWithTruncate(num: number, fixed: number): number {
        const regexMatcher = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?')
        const numStr = num.toString().match(regexMatcher)

        if (!numStr) {
            return 0
        }

        return parseFloat(numStr[0])
    },

    cl2ml(amount: number): number {
        return amount * 10
    },

    cl2oz(amount: number): number {
        return unitHandler.ml2oz(amount * 10)
    },

    oz2ml(amount: number): number {
        return numericQuantity(`${amount}`) * 30
    },

    oz2cl(amount: number): number {
        return unitHandler.oz2ml(amount) / 10
    },

    ml2oz(amount: number): number {
        return amount / 30
    },

    ml2cl(amount: number): number {
        return amount / 10
    },

    formatPrice(price: number, currency: string): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price)
    },

    isUnitConvertable(unit: string): boolean {
        return (unit.toLowerCase() == 'ml' || unit.toLowerCase() == 'oz' || unit.toLowerCase() == 'cl')
    },
}

export { unitHandler }