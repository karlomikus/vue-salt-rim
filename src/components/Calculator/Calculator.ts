export interface CalculatorFormulaInput {
    prefix: string|null;
    suffix: string|null;
    label: string;
    format: string|null;
    value: string;
    scopeName: string;
    sort: number;
}

export interface CalculatorFormulaEvaluation {
    prefix: string|null;
    suffix: string|null;
    label: string;
    format: string|null;
    sort: number;
    value: string;
    scopeName: string;
    result: string|null;
    error: string|null;
    decimalPlaces: number;
}

export interface Calculator {
    title: string;
    description: string|null;
    inputs: CalculatorFormulaInput[];
    evaluations: CalculatorFormulaEvaluation[];
}