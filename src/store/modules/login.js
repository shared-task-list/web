export default {
    namespaced: true,
    state: {
        lastLists: [],
    },
    getters: {
        lastLists(state) {
            return state.lastLists
        },
    },
    mutations: {
        loadLists(state, payload) {
            state.lastLists = payload
        },
        addLastList(state, item) {
            let existList = state.lastLists.filter((list) => list.hash === item.hash)

            if (existList.length === 0) {
                state.lastLists.push(item)
                localStorage.setItem('lastLists', JSON.stringify(state.lastLists))
            }
        },
        removeList(state, item) {
            let lists = state.lastLists.filter((list) => list.hash !== item.hash)
            state.lastLists = lists
            localStorage.setItem('lastLists', JSON.stringify(lists))
        }
    },
    actions: {
        loadLastLists(store) {
            let lists = JSON.parse(localStorage.getItem('lastLists'))

            if (lists === null || lists === undefined) {
                lists = []
            }

            store.commit('loadLists', lists)
        },
        removeList(store, item) {
            store.commit('removeList', item)
        },
        addLastList(store, item) {
            store.commit('addLastList', item)
        }
    }
};
