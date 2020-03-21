<template>
    <div>
        <div>
            <nav>
                <div class="nav-wrapper">
                    <a href="#" class="brand-logo">{{ this.currentListName }}</a>
                    <ul class="right">
                        <li><a @click="setTasks"><i class="material-icons">refresh</i></a></li>
                    </ul>
                </div>
            </nav>
        </div>
        <div id="spacer"></div>
        <div class="task-container">
            <div :key="cat" v-for="cat in categories">
                <div>
                    <h4>{{ cat }}</h4>
                    <div :key="task.Uid" v-for="task in taskMap.get(cat)">
                        <div class="row">
                            <router-link :to="{ name: 'taskDetail', params: { id: task.Uid }}">
                                <div class="task-title col s10 m10">
                                    {{ task.Title }}
                                </div>
                            </router-link>
                            <a class="btn-floating btn-small waves-effect waves-light green" @click="deleteTask(task)">
                                <i class="material-icons">done</i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bottom-spacer"></div>
        </div>


        <!-- menu button -->
        <div class="fixed-action-btn click-to-toggle">
            <a class="btn-floating btn-large blue">
                <i class="large material-icons">menu</i>
            </a>
            <ul>
                <li><a class="btn-floating red modal-trigger" href="#new-cat-modal"><i class="material-icons">add_circle_outline</i></a></li>
                <li><a class="btn-floating green darken-1 modal-trigger" href="#new-task-modal"><i class="material-icons">add</i></a></li>
<!--                <li><a class="btn-floating green"><i class="material-icons">settings</i></a></li>-->
                <li><a class="btn-floating blue" @click="exit"><i class="material-icons">exit_to_app</i></a></li>
            </ul>
        </div>

        <!-- add button -->
        <a id="quick-add-btn" class="btn-floating btn-large waves-effect waves-light green modal-trigger" href="#new-task-modal">
            <i class="material-icons">add</i>
        </a>

        <!-- add category modal-->
        <div id="new-cat-modal" class="modal">
            <div class="modal-content">
                <h4>New Category</h4>
                    <div class="input-field">
                        <input required
                               autofocus
                               v-model="newCategory"
                               type="text"
                               class="validate"
                               id="new-cat-name">
                        <label for="new-cat-name">Category Name</label>
                    </div>
            </div>
            <div class="modal-footer">
                <a href="#" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
                <a href="#"
                   @click="addNewCategory"
                   :disabled="newCategory.length === 0"
                   class="modal-close waves-effect waves-green btn-flat">
                    Create
                </a>
            </div>
        </div>

        <!-- add task modal-->
        <div id="new-task-modal" class="modal">
            <div class="modal-content">
                <h4>New Task</h4>
                <div class="input-field">
                    <input required
                           autofocus
                           v-model="newTaskTitle"
                           type="text"
                           class="validate"
                           id="new-task-name">
                    <label for="new-task-name">Task Title</label>
                </div>
                <p :key="category" v-for="category in categories">
                    <label>
                        <input name="group1"
                               type="radio"
                               :checked="categoryForNewTask === category"
                               @click="setCategoryForNewTask(category)" />
                        <span>{{ category }}</span>
                    </label>
                </p>
            </div>
            <div class="modal-footer">
                <a href="#" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
                <a href="#"
                   @click="createTask"
                   :disabled="newTaskTitle.length === 0"
                   class="modal-close waves-effect waves-green btn-flat">
                    Create
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex"
    import firebase from "firebase/app"
    import 'firebase/database'
    import M from 'materialize-css'
    import { v4 as uuidv4 } from 'uuid'
    import cfg from '../config'


    export default {
        name: "TaskList",
        data() {
            return {
                db: null,
                newCategory: '',
                newTaskTitle: '',
                currentListName: '',
                categoryForNewTask: cfg.noCategory
            };
        },
        mounted() {
            // set cached tasks
            let cachedTasks = JSON.parse(localStorage.getItem(cfg.lsKey.cachedTasks))

            if (cachedTasks !== null && cachedTasks.length !== 0) {
                this.setCategories(cachedTasks)
                this.loadTasks(cachedTasks)
            }

            // init firebase database
            this.db = firebase.database();
            this.setTasks()
            this.db.ref(this.listName).on('child_added', (snapshot) => {
                this.addTask(snapshot.val())
            })
            this.db.ref(this.listName).on('child_removed', (snapshot) => {
                this.removeTask(snapshot.val())
            })

            // init material elements
            let elems = document.querySelectorAll('.fixed-action-btn')
            M.FloatingActionButton.init(elems, {
                direction: 'top',
                hoverEnabled: false
            })

            elems = document.querySelectorAll('.modal')
            M.Modal.init(elems, {})

            // list name for nav
            let taskList = localStorage.getItem(cfg.lsKey.taskList)

            if (taskList !== null && taskList !== undefined) {
                this.currentListName = taskList
            }
        },
        computed: {
            ...mapGetters("task_list", {
                tasks: "tasks",
                taskMap: "taskMap",

            }),
            ...mapGetters("common", {
                listName: "listName",
                categories: "categories",
            }),
        },
        methods: {
            ...mapActions("task_list", {
                loadTasks: "loadTasks",
                removeTask: "removeTask",
                addTask: "addTask",
                clear: "clear",
            }),
            ...mapActions("common", {
                setCategories: "setCategories",
                addCategory: "addCategory",
            }),
            addNewCategory() {
                this.addCategory(this.newCategory)
                this.newCategory = ''
            },
            exit() {
                localStorage.setItem(cfg.lsKey.taskList, '')
                localStorage.setItem(cfg.lsKey.lastList, '')
                this.clear()
                this.$router.push({ path: 'login' })
            },
            createTask() {
                let username = localStorage.getItem(cfg.lsKey.login)
                let uid = uuidv4()
                let task = {
                    Author: username,
                    Comment: '',
                    Timestamp: new Date().toISOString(),
                    AuthorUid: '',
                    Category: this.categoryForNewTask,
                    Title: this.newTaskTitle,
                    Uid: uid,
                }
                this.db.ref(this.listName + '/' + uid).set(task)
                this.addTask(task)
                this.newTaskTitle = ''
            },
            deleteTask(task) {
                this.removeTask(task)
                this.db.ref(this.listName + '/' + task.Uid).set(null)
            },
            setCategoryForNewTask(category) {
                this.categoryForNewTask = category
            },
            setTasks() {
                this.db.ref(this.listName).once('value', (snapshot) => {
                    this.clear()
                    let tasks = []
                    snapshot.forEach((childSnapshot) => {
                        if (childSnapshot.val().Comment !== 'service task') {
                            tasks.push(childSnapshot.val())
                        }
                    })
                    this.setCategories(tasks)
                    this.loadTasks(tasks)
                })
            }
        },
    }
</script>

<style scoped>
    .row a {
        color: #000000;
    }
    #spacer {
        padding-top: 20px;
    }
    #bottom-spacer {
        padding-bottom: 60px;
    }
    #quick-add-btn {
        position: fixed;
        bottom: 23px;
        right: 90px;
    }
    .task-container {
        padding-left: 10px;
        background-color: #fff;
        /*margin-top: 60px;*/
    }
    .task-title {
        border: 1px solid #bbc;
        margin: 5px 0 0 0;
        border-radius: 20px;
        padding: 5px 10px;
        font-size: 16px;
    }
    .btn-floating {
        margin: 5px 0 0 15px;
    }
</style>
