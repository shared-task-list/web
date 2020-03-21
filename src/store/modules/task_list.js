import cfg from  '../../config'
const _ = require('lodash');

export default {
    namespaced: true,
    state: {
        tasks: [],
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
            let arr = Array.from(state.categories)
            arr = arr.filter((i) => i !== 'Без категории')
            arr.unshift('Без категории')
            return arr
        },
    },
    mutations: {
        loadTasks(state, tasks) {
            state.tasks = tasks
            let cats = new Set()

            for (let task of tasks) {
                if (task.Category === '') {
                    task.Category = cfg.noCategory
                }
                cats.add(task.Category)
            }
            for (let cat of cats) {
                if (cat === cfg.noCategory) {
                    state.taskMap.set(cfg.noCategory, tasks.filter(task => task.Category === cfg.noCategory))
                    continue
                }

                let taskArr = tasks.filter(task => task.Category === cat)
                let sorted = _.orderBy(taskArr, [(item) => Date.parse(item.Timestamp), 'asc'])
                state.taskMap.set(cat, sorted)
            }
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
    },
    actions: {
        loadTasks(store, tasks) {
            store.commit('loadTasks', tasks)
            localStorage.setItem(cfg.lsKey.cachedTasks, JSON.stringify(tasks))
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
    }
};
