import cfg from "../../config";

export default {
    namespaced: true,
    state: {
        listFullName: '',
        categories: [],
    },
    getters: {
        listName(state) {
            return state.listFullName
        },
        categories(state) {
            /*if (state.categories && state.categories.length > 0) {
                let arr = state.categories.filter((i) => i !== cfg.noCategory)
                arr.unshift(cfg.noCategory)
                return arr
            }*/

            return state.categories
        },
    },
    mutations: {
        setListName(state, payload) {
            state.listFullName = payload
        },
        setCategories(state, categories) {
            state.categories = categories
        },
        addCategory(state, category) {
            state.categories.push(category)
        },
    },
    actions: {
        setListName(store, name) {
            store.commit('setListName', name)
        },
        addCategory(store, category) {
            store.commit('addCategory', category)
        },
        setCategories(store, taskList) {
            let cats = new Set()

            for (let task of taskList) {
                if (task.Category === '') {
                    task.Category = cfg.noCategory
                }
                cats.add(task.Category)
            }

            store.commit('setCategories', Array.from(cats))
        },

    }
};
