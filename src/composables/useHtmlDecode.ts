export function useHtmlDecode(input: string): string {
    const txt = document.createElement('textarea')
    txt.innerHTML = input

    return txt.value
}
