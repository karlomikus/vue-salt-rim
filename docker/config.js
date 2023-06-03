const disableLogin = "$DISABLE_LOGIN";

window.srConfig = {}
window.srConfig.API_URL = "$API_URL"
window.srConfig.MEILISEARCH_URL = "$MEILISEARCH_URL";
window.srConfig.BAR_NAME = "$BAR_NAME";
window.srConfig.BAR_DESCRIPTION = "$DESCRIPTION";
window.srConfig.DEFAULT_LOCALE = "$DEFAULT_LOCALE";

if (disableLogin != "") {
    window.srConfig.DISABLE_LOGIN = !!disableLogin;
}
