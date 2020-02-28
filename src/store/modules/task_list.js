export default {
    namespaced: true,
    state: {
        tasks: [],
        categories: [],
        taskMap: new Map()
    },
    getters: {
        tasks(state) {
            return state.tasks
        },
        taskMap(state) {
            return state.taskMap
        },
        categories(state) {
            return state.categories
        },
    },
    mutations: {
        loadTasks(state, tasks) {
            state.tasks = tasks
            let cats = new Set()

            for (let task of tasks) {
                if (task.Category === null || task.Category === '') {
                    task.Category = 'Без категории'
                }
                cats.add(task.Category)
            }
            for (let cat of cats) {
                if (cat === 'Без категории') {
                    state.taskMap.set('Без категории', tasks.filter(task => task.Category === 'Без категории'))
                    continue
                }
                state.taskMap.set(cat, tasks.filter(task => task.Category === cat))
            }

            state.categories = Array.from(cats)
        },
        removeTask(state, task) {
            state.tasks = state.tasks.filter(item => item.Uid !== task.Uid)
            let catTasks = state.tasks.filter(item => item.Category === task.Category)
            let newMap = state.taskMap

            if (catTasks.length === 0) {
                newMap.delete(task.Category)
                state.categories = state.categories.filter((cat) => cat !== task.Category)
            } else {
                newMap.set(task.Category, catTasks)
            }

            state.taskMap = new Map(newMap)
        },
        addTask(state, task) {
            let existTask = state.tasks.filter((t) => t.Uid === task.Uid)

            if (existTask.length > 0) {
                return
            }

            state.tasks.push(task)
            let catTasks = state.tasks.filter(item => item.Category === task.Category)
            let newMap = new Map(state.taskMap)

            if (catTasks.length === 0) {
                state.categories.push(task.Category)
            }

            newMap.set(task.Category, catTasks)
            state.taskMap = new Map(newMap)
        },
        clear(state) {
            state.tasks = []
            state.taskMap.clear()
        },
        addCategory(state, category) {
            state.categories.push(category)
        },
    },
    actions: {
        loadTasks(store, tasks) {
            store.commit('loadTasks', tasks)
            localStorage.setItem('cachedTasks', JSON.stringify(tasks))
        },
        removeTask(store, task) {
            store.commit('removeTask', task)
        },
        addTask(store, task) {
            store.commit('addTask', task)
        },
        clear(store) {
            store.commit('clear')
        },
        addCategory(store, category) {
            store.commit('addCategory', category)
        },
    }
};
