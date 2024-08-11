import { expect, test } from 'vitest'
import UnitHandler from './UnitHandler'

test('format numbers as fraction', () => {
    expect(UnitHandler.asFraction(1.5)).toBe('1 1/2')
    expect(UnitHandler.asFraction(1)).toBe('1')
    expect(UnitHandler.asFraction(0.5)).toBe('1/2')
})

test('format numbers as decimal', () => {
    expect(UnitHandler.asDecimal('1 1/2')).toBe(1.5)
    expect(UnitHandler.asDecimal('1')).toBe(1)
    expect(UnitHandler.asDecimal('1/2')).toBe(0.5)
})

test('ingredients are pretty printed', () => {
    expect(UnitHandler.print({ amount: 30, units: 'ml' })).toBe('30 ml')
    expect(UnitHandler.print({ amount: 30, amount_max: 60, units: 'ml' })).toBe('30-60 ml')
    expect(UnitHandler.print({ amount: 30, units: 'ml' }, 'oz')).toBe('1 oz')
    expect(UnitHandler.print({ amount: 1, amount_max: '1 1/2', units: 'oz' }, 'ml')).toBe('30-45 ml')
    expect(UnitHandler.print({ amount: '1/8', units: 'teaspoon' })).toBe('0.125 teaspoon')
    expect(UnitHandler.print({ amount: '500', units: 'unconvertable' }, 'cl')).toBe('500 unconvertable')
    expect(UnitHandler.print({ amount: 60, units: 'ml' }, 'ml', 3)).toBe('180 ml')
    expect(UnitHandler.print({ amount: null, units: 'ml' }, 'ml')).toBe('0 ml')
    expect(UnitHandler.print({ amount: null, amount_max: null, units: 'ml' }, 'ml')).toBe('0 ml')
})

test('numbers are fixed and truncated', () => {
    expect(UnitHandler.toFixedWithTruncate(1.2333333333339, 2)).toBe('1.23')
    expect(UnitHandler.toFixedWithTruncate(9.00, 3)).toBe('9')
})

test('converts units', () => {
    expect(UnitHandler.convertFromTo('oz', 1, 'ml')).toBe(30)
    expect(UnitHandler.convertFromTo('oz', 1, 'cl')).toBe(3)
    expect(UnitHandler.convertFromTo('ml', 30, 'oz')).toBe(1)
    expect(UnitHandler.convertFromTo('ml', 30, 'cl')).toBe(3)
    expect(UnitHandler.convertFromTo('cl', 3, 'oz')).toBe(1)
    expect(UnitHandler.convertFromTo('cl', 3, 'ml')).toBe(30)
})

test('formats prices', () => {
    expect(UnitHandler.formatPrice(30, 'USD')).toBe('$30.00')
    expect(UnitHandler.formatPrice(25.99, 'EUR')).toBe('€25.99')
})