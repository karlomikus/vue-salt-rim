class Utils {
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
        default:
            return null
        }

    }
}

export default Utils
