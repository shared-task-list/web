import cfg from "src/config";

export default {
    namespaced: true,
    state: {
        listFullName: '',
        categories: [],
        bgColor: '',
        showQuickAdd: '',
    },
    getters: {
        listName(state) {
            return state.listFullName
        },
        categories(state) {
            if (state.categories.length === 0) {
                return  JSON.parse(localStorage.getItem(cfg.lsKey.categories) ?? '[]')
            }
            return state.categories
        },
        bgColor(state) {
            if (state.bgColor === '') {
                return localStorage.getItem(cfg.lsKey.bgColor)
            }
            return state.bgColor
        },
        showQuickAdd(state) {
            if (state.showQuickAdd === '') {
                state.showQuickAdd = localStorage.getItem(cfg.lsKey.bgColor) ?? 'true'
            }
            return state.showQuickAdd === 'true'
        },
    },
    mutations: {
        setListName(state, payload) {
            state.listFullName = payload
        },
        setCategories(state, categories) {
            state.categories = saveCategories(categories, state.listFullName)
        },
        addCategory(state, category) {
            state.categories.push(category)
            localStorage.setItem(cfg.lsKey.categories, JSON.stringify(state.categories))
        },
        addCategoryColor(state, item) {
            for (let i = 0; i < state.categories.length; ++i) {
                if (state.categories[i].name === item.name) {
                    state.categories[i].color = item.color
                    break
                }
            }
            localStorage.setItem(cfg.lsKey.categories, JSON.stringify(state.categories))
        },
        setBgColor(state, color) {
            localStorage.setItem(cfg.lsKey.bgColor, color)
            state.bgColor = color
        },
        setShowQuickAdd(state, isShow) {
            localStorage.setItem(cfg.lsKey.showQuickAdd, isShow)
            state.showQuickAdd = isShow
        },
        removeCategory(state, categoryName) {
            state.categories = state.categories?.filter(item => item.name !== categoryName)
            localStorage.setItem(cfg.lsKey.categories, JSON.stringify(state.categories))
        },
        updateCategory(state, data) {
            for (let i = 0; i < state.categories.length; ++i) {
                if (state.categories[i].name === data.oldName) {
                    state.categories[i].name = data.newName
                    break
                }
            }
            localStorage.setItem(cfg.lsKey.categories, JSON.stringify(state.categories))
        },
    },
    actions: {
        setListName(store, name) {
            store.commit('setListName', name)
        },
        addCategory(store, name) {
            let ts = new Date().getTime()
            let  category = {
                name: name,
                date: ts,
                isExpanded: true,
                order: ts,
                color: '#ffffff',
            }
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

            store.commit('setCategories', cats)
        },
        addCategoryColor(store, item) {
            store.commit('addCategoryColor', item)
        },
        setBgColor(store, color) {
            store.commit('setBgColor', color)
        },
        setShowQuickAdd(store, isShow) {
            store.commit('setShowQuickAdd', isShow)
        },
        removeCategory(store, categoryName) {
            store.commit('removeCategory', categoryName)
        },
        updateCategory(store, data) {
            store.commit('updateCategory', data)
        },
    }
};

function saveCategories(cats, list) {
    let savedCats = JSON.parse(localStorage.getItem(cfg.lsKey.categories) ?? '[]')
    let catColors = JSON.parse(localStorage.getItem(cfg.lsKey.categoriesColors))

    for (let cat of cats) {
        let item = savedCats.find((i) => i.name === cat)

        if (item === undefined) {
            let ts = new Date().getTime()
            savedCats.push({
                name: cat,
                date: ts,
                isExpanded: true,
                order: ts,
                color: '#ffffff',
                list: list
            })
        }
    }
    if (catColors !== null) {
        for (let cat of catColors) {
            for (let i = 0; i < savedCats.length; ++i) {
                if (savedCats[i].name === cat.name) {
                    savedCats[i].color = cat.color
                    break
                }
            }
        }
        // localStorage.delete(cfg.lsKey.categoriesColors)
    }

    localStorage.setItem(cfg.lsKey.categories, JSON.stringify(savedCats))
    return savedCats
}
