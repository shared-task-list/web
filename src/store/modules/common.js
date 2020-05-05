import cfg from "src/config";

export default {
    namespaced: true,
    state: {
        listFullName: '',
        categories: [],
        categoryColors: new Map(),
        bgColor: '',
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
        categoryColors(state) {
            let savedCats = JSON.parse(localStorage.getItem(cfg.lsKey.categoriesColors) ?? '[]')

            for (let item of savedCats) {
                state.categoryColors.set(item.name, item.color)
            }

            return state.categoryColors
        },
        bgColor(state) {
            return localStorage.getItem(cfg.lsKey.bgColor)
        }
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
        addCategoryColor(state, item) {
            state.categoryColors.set(item.name, item.color)
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

            let savedCats = localStorage.getItem(cfg.lsKey.categoriesColors) ??  '[]'

            setColors(savedCats, cats)
            store.commit('setCategories', Array.from(cats))
        },
        addCategoryColor(store, item) {
            store.commit('addCategoryColor', item)
        },
    }
};

function setColors(savedCats, taskCats) {
    let catsObject = JSON.parse(savedCats)
    let forSave = []

    for (let cat of taskCats) {
        let item = catsObject.find((i) => i.name === cat)

        if (item !== undefined) {
            forSave.push(item)
        }
    }

    localStorage.setItem(cfg.lsKey.categoriesColors, JSON.stringify(forSave))
}

function saveCategories(cats) {
    let savedCats = JSON.parse(localStorage.getItem(cfg.lsKey.categories) ??  '[]')
    let forSave = []

    for (let cat of cats) {
        let item = savedCats.find((i) => i.name === cat)

        if (item !== undefined) {
            forSave.push(item)
        } else {
            forSave.push({
                name: cat,
                date: new Date().getTime(),
                isExpanded: true,
            })
        }
    }

    localStorage.setItem(cfg.lsKey.categories, JSON.stringify(forSave))
    return forSave
}
