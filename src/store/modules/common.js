export default {
    namespaced: true,
    state: {
        listName: '',
        categories: [],
    },
    getters: {
        listName(state) {
            return state.listName
        },
    },
    mutations: {
        setListName(state, payload) {
            state.listName = payload
        },
    },
    actions: {
        setListName(store, name) {
            store.commit('setListName', name)
        },
    }
};