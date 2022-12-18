class Utils {
    static decodeHtml(string) {
        var txt = document.createElement("textarea");
        txt.innerHTML = string;

        return txt.value;
    }
}

export default Utils;
