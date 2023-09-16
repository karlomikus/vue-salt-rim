import Unitz from 'unitz'

class Utils {
    static decodeHtml(string) {
        var txt = document.createElement('textarea')
        txt.innerHTML = string

        return txt.value
    }

    static printIngredientAmount(ingredient, convertTo = 'ml', servings = 1) {
        if (!convertTo) {
            convertTo = 'ml'
        }

        let orgAmount = ingredient.amount * servings
        let orgAmountMax = (ingredient.amount_max || 0) * servings
        let orgUnits = ingredient.units ? ingredient.units.toLowerCase() : ''

        // Don't convert unconvertable units
        if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
            return `${orgAmount}${orgAmountMax != 0 ? '-' + orgAmountMax : ''} ${orgUnits}`
        }

        const minAmount = this.convertFromTo(orgUnits, orgAmount, convertTo);
        const maxAmount = this.convertFromTo(orgUnits, orgAmountMax, convertTo);

        return `${minAmount}${maxAmount != 0 ? '-' + maxAmount : ''} ${convertTo}`
    }

    static cl2ml(amount) {
        return amount * 10
    }

    static cl2oz(amount) {
        return this.ml2oz(amount * 10)
    }

    static oz2ml(amount) {
        return Unitz.parse(`${amount} fl-oz`).value * 30
    }

    static oz2cl(amount) {
        return this.oz2ml(amount) / 10
    }

    static ml2oz(amount) {
        return new Unitz.Fraction(amount / 30, [2, 3, 4]).string
    }

    static ml2cl(amount) {
        return amount / 10
    }

    static convertFromTo(fromUnits, amount, toUnits) {
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
            if (toUnits == 'cl') {
                return this.cl2oz(amount)
            }
        }

        return amount
    }

    static getRoleName(roleId) {
        switch (roleId) {
        case 1:
            return 'admin'
        case 2:
            return 'moderator'
        case 3:
            return 'general'
        default:
            return null
        }

    }
}

export default Utils
