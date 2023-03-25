import Unitz from 'unitz'

class Utils {
    static decodeHtml(string) {
        var txt = document.createElement("textarea");
        txt.innerHTML = string;

        return txt.value;
    }

    static printIngredientAmount(ingredient, convertTo = 'ml', servings = 1) {
        if (!convertTo) {
            convertTo = 'ml';
        }

        let orgAmount = ingredient.amount;
        let orgUnits = ingredient.units.toLowerCase();

        // Don't convert unconvertable units
        if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
            return `${orgAmount * servings} ${orgUnits}`;
        }

        // Convert to ml if needed as it's our "base"
        if (orgUnits == 'oz') {
            orgAmount = this.oz2ml(orgAmount)
        } else if (orgUnits == 'cl') {
            orgAmount = this.cl2ml(orgAmount)
        }

        orgAmount *= servings;

        if (convertTo == 'oz') {
            return this.ml2oz(orgAmount) + ' oz'
        }

        if (convertTo == 'cl') {
            return this.ml2cl(orgAmount) + ' cl'
        }

        if (convertTo == 'ml') {
            return orgAmount + ' ml'
        }

        return `${orgAmount} ${orgUnits}`;
    }

    static cl2ml(amount) {
        return amount * 10;
    }

    static ml2cl(amount) {
        return amount / 10;
    }

    static oz2ml(amount) {
        return Unitz.parse(`${amount} fl-oz`).value * 30
    }

    static ml2oz(amount) {
        return new Unitz.Fraction(amount / 30, [2, 3, 4]).string
    }
}

export default Utils;
