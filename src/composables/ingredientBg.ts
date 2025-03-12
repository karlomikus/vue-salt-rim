const useIngredientBg = (hex: string) => {
    let c: number | string[] | null = null;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');

        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }

        const hexValue = Number('0x' + c.join(''));
        const red = (hexValue >> 16) & 255;
        const green = (hexValue >> 8) & 255;
        const blue = hexValue & 255;

        return `rgba(${red}, ${green}, ${blue}, 0.3)`;
    }

    return hex;
}

export { useIngredientBg }