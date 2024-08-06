import Unitz from 'unitz'

export default {
    /**
     * Pretty print ingredient amount with units.
     * Handles min and max amounts.
     * Handles oz presentation as fractions.
     * Handles servings.
     * Converts between: oz, cl, ml.
     *
     * @param {object} ingredient
     * @param {string} convertTo
     * @param {number} servings
     * @returns {string}
     */
    print(ingredient, convertTo = 'ml', servings = 1) {
        let orgAmount = Unitz.parse(`${ingredient.amount}`).value
        let orgAmountMax = Unitz.parse(`${(ingredient.amount_max || 0)}`).value

        orgAmount *= servings
        orgAmountMax *= servings

        let orgUnits = ingredient.units ? ingredient.units.toLowerCase() : ''

        // Don't convert unconvertable units
        if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
            return `${orgAmount == 0 ? '' : orgAmount}${orgAmountMax != 0 ? '-' + orgAmountMax : ''} ${orgUnits}`
        }

        let minAmount = this.convertFromTo(orgUnits, orgAmount, convertTo)
        let maxAmount = this.convertFromTo(orgUnits, orgAmountMax, convertTo)

        minAmount = this.toFixedWithTruncate(minAmount, 2)
        maxAmount = this.toFixedWithTruncate(maxAmount, 2)

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
        return new Unitz.Fraction(number, [2, 3, 4]).string
    },

    /**
     * Converts fractions and forces number return type
     *
     * @param {string} fraction 
     * @returns {number}
     */
    asDecimal(fraction) {
        const val = Unitz.parse(fraction).value

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
        if (fromUnits == 'ml') {
            if (toUnits == 'oz') {
                return this.ml2oz(amount)
            }
            if (toUnits == 'cl') {
                return this.ml2cl(amount)
            }
        }

        if (fromUnits == 'oz') {
            if (toUnits == 'ml') {
                return this.oz2ml(amount)
            }
            if (toUnits == 'cl') {
                return this.oz2cl(amount)
            }
        }

        if (fromUnits == 'cl') {
            if (toUnits == 'ml') {
                return this.cl2ml(amount)
            }
            if (toUnits == 'oz') {
                return this.cl2oz(amount)
            }
        }

        return amount
    },

    toFixedWithTruncate(num, fixed) {
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
        return this.ml2oz(amount * 10)
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    oz2ml(amount) {
        return Unitz.parse(`${amount} fl-oz`).value * 30
    },

    /**
     * @param {number} amount
     * @returns {number}
     */
    oz2cl(amount) {
        return this.oz2ml(amount) / 10
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
