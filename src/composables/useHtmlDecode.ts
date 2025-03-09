import { decode } from 'entities'

export function useHtmlDecode(input: string): string {
    return decode(input)
}
