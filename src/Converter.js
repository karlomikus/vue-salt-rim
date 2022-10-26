import configureMeasurements from 'convert-units';
import allMeasures from 'convert-units/definitions/all';

const convert = configureMeasurements(allMeasures);

// function convert(amount, currentUnit, toUnit) {
//     if (currentUnit == 'ml') {
//         return toOz(amount)
//     }

//     return amount
// }

// function toOz(amount) {
//     return amount / 30;
// }

export default convert;
