const metaThemeColor: Record<string, string> = {
    'dark': '#282238',
    'light': '#584b75',
}

const useTheme = (theme: string): void => {
    const darkThemeCssClassName = `dark-theme`

    document.body.classList.remove(darkThemeCssClassName)
    if (theme === 'dark') {
        document.body.classList.add(darkThemeCssClassName)
    } else {
        document.body.classList.remove(darkThemeCssClassName)
    }

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', metaThemeColor[theme])
}

export { useTheme }