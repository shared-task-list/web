<template>
    <div>
        <nav>
            <div class="nav-wrapper">
                <a href="#" class="brand-logo">{{ this.currentListName }}</a>
                <ul class="right">
                    <li><a @click="refresh" href="#"><i class="material-icons">refresh</i></a></li>
                </ul>
            </div>
        </nav>
        <div id="spacer"></div>
        <div :key="index" v-for="(cat, index) in categories" class="task-container">
            <h4>{{ cat }}</h4>
            <div :key="task.Uid" v-for="task in taskMap.get(cat)">
                <div class="row">
                    <div class="task-title col s10 m10">
                        {{ task.Title }}
                    </div>
                    <a class="btn-floating btn-small waves-effect waves-light green" @click="deleteTask(task)">
                        <i class="material-icons">done</i>
                    </a>
                </div>
            </div>
        </div>
        <div id="bottom-spacer"></div>

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
                           v-model="newTaskTitle"
                           type="text"
                           class="validate"
                           id="new-task-name">
                    <label for="new-task-name">Task Title</label>
                </div>
                <div>
                    <p>Category: {{ categoryForNewTask }}</p>
                </div>
                <div class="row">
                    <a class='dropdown-trigger btn col s12 m12' href='#' data-target='cats-dropdown'>
                        Choose Category
                    </a>
                </div>

                <!-- dropdown-->
                <ul id='cats-dropdown' class='dropdown-content'>
                    <li :key="category" v-for="category in categories">
                        <a href="#" @click="setCategoryForNewTask(category)">{{ category }}</a>
                    </li>
                </ul>
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


    export default {
        name: "TaskList",
        data() {
            return {
                db: null,
                newCategory: '',
                newTaskTitle: '',
                currentListName: '',
                categoryForNewTask: 'Без категории'
            };
        },
        mounted() {
            let cachedTasks = JSON.parse(localStorage.getItem('cachedTasks'))

            if (cachedTasks !== null && cachedTasks.length !== 0) {
                this.loadTasks(cachedTasks)
            }

            this.db = firebase.database();
            this.db.ref(this.listName).once('value', (snapshot) => {
                this.clear()
                let tasks = []
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val().Comment !== 'service task') {
                        tasks.push(childSnapshot.val())
                    }
                })
                this.loadTasks(tasks)
            })
            this.db.ref(this.listName).on('child_added', (snapshot) => {
                this.addTask(snapshot.val())
            })
            this.db.ref(this.listName).on('child_removed', (snapshot) => {
                this.removeTask(snapshot.val())
            })

            let elems = document.querySelectorAll('.fixed-action-btn')
            M.FloatingActionButton.init(elems, {
                direction: 'top',
                hoverEnabled: false
            })

            elems = document.querySelectorAll('.modal')
            M.Modal.init(elems, {})

            elems = document.querySelectorAll('.dropdown-trigger');
            M.Dropdown.init(elems, {});

            let taskList = localStorage.getItem('taskList')

            if (taskList !== null && taskList !== undefined) {
                this.currentListName = localStorage.getItem('taskList')
            }
        },
        computed: {
            ...mapGetters("task_list", {
                tasks: "tasks",
                taskMap: "taskMap",
                categories: "categories",
            }),
            ...mapGetters("common", {
                listName: "listName",
            })
        },
        methods: {
            ...mapActions("task_list", {
                loadTasks: "loadTasks",
                removeTask: "removeTask",
                addTask: "addTask",
                clear: "clear",
                addCategory: "addCategory",
            }),
            addNewCategory() {
                this.addCategory(this.newCategory)
                this.newCategory = ''
            },
            exit() {
                localStorage.setItem('taskList', null)
                localStorage.setItem('lastList', null)
                this.$router.push({ path: 'login' })
            },
            createTask() {
                let username = localStorage.getItem('login')
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
                this.db.ref(this.listName + '/' + uid).set(task).then(() => {
                    this.newTaskTitle = ''
                    this.categoryForNewTask = 'Без категории'
                    this.addTask(task)
                })
            },
            deleteTask(task) {
                this.db.ref(this.listName + '/' + task.Uid).set(null).then(() => {
                    this.removeTask(task)
                })
            },
            setCategoryForNewTask(category) {
                this.categoryForNewTask = category
            },
            refresh() {
                this.db.ref(this.listName).once('value', (snapshot) => {
                    this.clear()
                    let tasks = []
                    snapshot.forEach((childSnapshot) => {
                        if (childSnapshot.val().Comment !== 'service task') {
                            tasks.push(childSnapshot.val())
                        }
                    })
                    this.loadTasks(tasks)
                })
            }
        },
    }
</script>

<style scoped>
    #spacer {
        margin-top: 20px;
    }
    #bottom-spacer {
        margin-bottom: 60px;
    }
    #quick-add-btn {
        position: fixed;
        bottom: 23px;
        right: 90px;
    }
    .task-container {
        margin-left: 10px;
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
