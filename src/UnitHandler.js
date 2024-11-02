import { numericQuantity } from 'numeric-quantity';
import { formatQuantity } from 'format-quantity';

const handler = {
    /**
     * Pretty print ingredient amount with units.
     * Handles min and max amounts.
     * Handles oz presentation as fractions.
     * Handles servings.
     * Converts between: oz, cl, ml.
     *
     * @param {object} ingredient
     * @param {string} convertTo
     * @param {number} scaleFactor
     * @returns {string}
     */
    print(ingredient, convertTo = 'ml', scaleFactor = 1) {
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

        let orgUnits = ingredient.units ? ingredient.units.toLowerCase() : ''

        // Don't convert unconvertable units
        if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
            return `${orgAmount == 0 ? '' : orgAmount}${orgAmountMax != 0 ? '-' + orgAmountMax : ''} ${orgUnits}`
        }

        let minAmount = this.convertFromTo(orgUnits, orgAmount, convertTo)
        let maxAmount = this.convertFromTo(orgUnits, orgAmountMax, convertTo)

        minAmount = this.toFixedWithTruncate(minAmount, 3)
        maxAmount = this.toFixedWithTruncate(maxAmount, 3)

        if (convertTo == 'oz') {
            minAmount = this.asFraction(minAmount)
            maxAmount = this.asFraction(maxAmount)
        }

        return `${minAmount == 0 ? '0' : minAmount}${maxAmount != 0 ? '-' + maxAmount : ''} ${convertTo}`
    },

    /**
     * @param {number} number
     * @returns {string}
     */
    asFraction(number) {
        return formatQuantity(number)
    },

    /**
     * Converts fractions and forces number return type
     *
     * @param {string} fraction 
     * @returns {number}
     */
    asDecimal(fraction) {
        const val = numericQuantity(fraction)

        if (val === false) {
            return 0
        }

        return val
    },

    /**
     * @param {string} fromUnits
     * @param {number} amount
     * @param {string} toUnits
     * @returns {number}
     */
    convertFromTo(fromUnits, amount, toUnits) {
        const conversionMap = {
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

    toFixedWithTruncate(num, fixed) {
        if (num == null || isNaN(num) || num == Infinity) {
            return ''
        }

        var re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?')

        return num.toString().match(re)[0]
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    cl2ml(amount) {
        return amount * 10
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    cl2oz(amount) {
        return handler.ml2oz(amount * 10)
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    oz2ml(amount) {
        return numericQuantity(`${amount}`) * 30
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    oz2cl(amount) {
        return handler.oz2ml(amount) / 10
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    ml2oz(amount) {
        return amount / 30
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    ml2cl(amount) {
        return amount / 10
    },

    /**
     * @param {number} price 
     * @param {string} currency 
     * @returns {string}
     */
    formatPrice(price, currency) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price)
    },

    /**
     * @param {string} unit
     * @returns {boolean}
     */
    isUnitConvertable(unit) {
        return (unit.toLowerCase() == 'ml' || unit.toLowerCase() == 'oz' || unit.toLowerCase() == 'cl')
    },
}

export default handler