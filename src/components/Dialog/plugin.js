import dialogstuff from './index'

export default {
    install: (app, options) => {
        app.config.globalProperties.$dialog = (messsage, dialogOptions) => {
            const dialogElement = dialogstuff.customConfirm(messsage, dialogOptions);
            return dialogElement;
        }
    }
}
