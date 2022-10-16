import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        name: '',
        isAdmin: false,
        favoriteCocktails: []
    }),

    actions: {
        setUser(userResp) {
            this.id = userResp.id;
            this.favoriteCocktails = userResp.favorite_cocktails;
        },
    },
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
