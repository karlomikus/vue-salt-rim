import { expect, test } from 'vitest'
import { unitHandler } from './../useUnits'

test('format numbers as fraction', () => {
    expect(unitHandler.asFraction(1.5)).toBe('1 1/2')
    expect(unitHandler.asFraction(1)).toBe('1')
    expect(unitHandler.asFraction(0.5)).toBe('1/2')
})

test('format numbers as decimal', () => {
    expect(unitHandler.asDecimal('1 1/2')).toBe(1.5)
    expect(unitHandler.asDecimal('1')).toBe(1)
    expect(unitHandler.asDecimal('1/2')).toBe(0.5)
})

test('ingredients are pretty printed', () => {
    expect(unitHandler.print({ amount: 30, units: 'ml' })).toBe('30 ml')
    expect(unitHandler.print({ amount: 30, amount_max: 60, units: 'ml' })).toBe('30-60 ml')
    expect(unitHandler.print({ amount: 30, units: 'ml' }, 'oz')).toBe('1 oz')
    expect(unitHandler.print({ amount: 1, amount_max: '1 1/2', units: 'oz' }, 'ml')).toBe('30-45 ml')
    expect(unitHandler.print({ amount: '1/8', units: 'teaspoon' })).toBe('0.125 teaspoon')
    expect(unitHandler.print({ amount: '500', units: 'unconvertable' }, 'cl')).toBe('500 unconvertable')
    expect(unitHandler.print({ amount: 60, units: 'ml' }, 'ml', 3)).toBe('180 ml')
    expect(unitHandler.print({ amount: null, units: 'ml' }, 'ml')).toBe('0 ml')
    expect(unitHandler.print({ amount: null, amount_max: null, units: 'ml' }, 'ml')).toBe('0 ml')
    expect(unitHandler.print({ amount: '0.125', units: 'oz' }, 'oz')).toBe('1/8 oz')
})

test('numbers are fixed and truncated', () => {
    expect(unitHandler.toFixedWithTruncate(1.2333333333339, 2)).toBe(1.23)
    expect(unitHandler.toFixedWithTruncate(9.00, 3)).toBe(9)
    expect(unitHandler.toFixedWithTruncate(9, 3)).toBe(9)
})

test('converts units', () => {
    expect(unitHandler.convertFromTo('oz', 1, 'ml')).toBe(30)
    expect(unitHandler.convertFromTo('oz', 1, 'cl')).toBe(3)
    expect(unitHandler.convertFromTo('ml', 30, 'oz')).toBe(1)
    expect(unitHandler.convertFromTo('ml', 30, 'cl')).toBe(3)
    expect(unitHandler.convertFromTo('cl', 3, 'oz')).toBe(1)
    expect(unitHandler.convertFromTo('cl', 3, 'ml')).toBe(30)
})

test('formats prices', () => {
    expect(unitHandler.formatPrice(30, 'USD')).toBe('$30.00')
    expect(unitHandler.formatPrice(25.99, 'EUR')).toBe('€25.99')
})