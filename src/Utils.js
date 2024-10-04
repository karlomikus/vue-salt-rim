class Utils {
    static copyToClipboard(string) {
        try {
            const clipboard = navigator.clipboard;
            clipboard.writeText(string);
            return true
        } catch (error) {
            console.error('Failed to copy: ', error);
            return false
        }
    }

    static decodeHtml(string) {
        var txt = document.createElement('textarea')
        txt.innerHTML = string

        return txt.value
    }

    static getRoleName(roleId) {
        switch (roleId) {
            case 1:
                return 'admin'
            case 2:
                return 'moderator'
            case 3:
                return 'general'
            case 4:
                return 'guest'
            default:
                return null
        }

    }
}

export default Utils
