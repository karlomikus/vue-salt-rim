class Utils {
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
