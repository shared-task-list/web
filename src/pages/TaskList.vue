<template>
    <q-page>
        <q-pull-to-refresh @refresh="setTasks">
<!--            <div class="task-container" :style="{ backgroundColor: bgColor }">-->
            <div class="task-container">
                <div :key="cat" v-for="cat in categories" class="task-list">
                    <q-expansion-item
                        default-opened
                        :header-style="{ fontSize: '24px', marginTop: '25px' }"
                    >
                        <template v-slot:header>
                            <q-item-section avatar>
                                <q-btn
                                    @click.stop="showColorPicker(cat)"
                                    size="md"
                                    flat
                                    round
                                    color="secondary"
                                    icon="palette"/>
                            </q-item-section>
                            <q-item-section>
                                {{ cat }}
                            </q-item-section>
                        </template>

                        <div class="full-width btn-add-container">
                            <q-btn
                                flat
                                label="Add New"
                                color="primary"
                                @click="addInCategory(cat)"
                                class="content-center"
                            />
                        </div>

                        <div :key="task.Uid" v-for="task in taskMap.get(cat)">
                            <div class="row task-row-container">
                                <div class="task-title" :style="{ backgroundColor: categoryColors.get(cat) }">
                                    <router-link :to="{ name: 'taskDetail', params: { id: task.Uid }}">
                                        <div>
                                            {{ task.Title }}
                                        </div>
                                    </router-link>
                                </div>
                                <q-btn
                                    size="sm"
                                    round
                                    color="secondary"
                                    icon="done"
                                    class="btn-done"
                                    @click="deleteTask(task)" />
                            </div>
                        </div>
                    </q-expansion-item>
                </div>

            </div>
        </q-pull-to-refresh>
        <div id="bottom-spacer"></div>

        <!-- menu button -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <div class="q-mt-md">
                <q-fab
                    external-label
                    vertical-actions-align="left"
                    label-position="left"
                    color="secondary"
                    icon="menu"
                    direction="up"
                >
                    <q-fab-action v-go-back=" '/login' " @click="exit" label-position="left" external-label color="accent"  icon="exit_to_app" label="Exit" />

                    <router-link :to="{ name: 'settings' }">
                        <q-fab-action label-position="left" external-label color="orange"  icon="settings" label="Settings" />
                    </router-link>
                    <router-link :to="{ name: 'create' }">
                        <q-fab-action label-position="left" external-label color="secondary"  icon="add" label="Add Task" />
                    </router-link>

                    <q-fab-action @click="isShowAddCategory = true" label-position="left" external-label color="primary"  icon="add_circle_outline" label="Add Category" />
                </q-fab>
            </div>
        </q-page-sticky>

        <!-- add button -->
        <q-page-sticky position="bottom-right" :offset="[18*5, 18]">
            <div class="q-mt-md">
                <q-fab
                    vertical-actions-align="left"
                    label-position="left"
                    color="primary"
                    icon="add"
                    @click="showQuickAdd"
                >
                </q-fab>
            </div>
        </q-page-sticky>

        <!-- add category modal-->
        <q-dialog v-model="isShowAddCategory">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New Category</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newCategory" autofocus @keyup.enter="prompt = false" />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Add category" v-close-popup @click="addNewCategory" :disabled="newCategory.length === 0" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- add task modal-->
        <q-dialog v-model="isShowAddTask">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New Task</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newTaskTitle" autofocus @keyup.enter="prompt = false" />
                </q-card-section>

                <div class="q-pa-lg">
                    <q-option-group
                        v-model="categoryForNewTask"
                        :options="groupOptions"
                        color="primary"
                    />
                </div>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Add task" v-close-popup @click="createTask" :disabled="newTaskTitle.length === 0" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- color dialog-->
        <q-dialog v-model="isShowColorPicker">
            <q-card style="min-width: 350px">
                <q-color v-model="newColor" no-header class="my-picker" default-view="palette" />

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Set for category" v-close-popup @click="setColorForCategory" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
    import { mapActions, mapGetters } from "vuex"
    import firebase from "firebase/app"
    import 'firebase/database'
    import { v4 as uuidv4 } from 'uuid'
    import cfg from 'src/config'


    export default {
        name: "TaskList",
        data() {
            return {
                db: null,
                newCategory: '',
                newTaskTitle: '',
                currentListName: '',
                categoryForNewTask: cfg.noCategory,
                isShowAddCategory: false,
                isShowAddTask: false,
                isShowColorPicker: false,
                groupOptions: [],
                newColor: '',
                colorCategory: '',
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
                categoryColors: "categoryColors",
                bgColor: "bgColor",
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
                addCategoryColor: "addCategoryColor",
            }),
            showQuickAdd() {
                this.groupOptions = []

                for (let cat of this.categories)  {
                    this.groupOptions.push({
                        label: cat,
                        value: cat,
                    })
                }

                this.isShowAddTask = true
            },
            addInCategory(category) {
                this.categoryForNewTask = category
                this.showQuickAdd()
            },
            showColorPicker(category) {
                this.colorCategory = category
                this.isShowColorPicker = true
            },
            addNewCategory() {
                this.addCategory(this.newCategory)
                this.newCategory = ''
            },
            exit() {
                localStorage.setItem(cfg.lsKey.taskList, '')
                localStorage.setItem(cfg.lsKey.lastList, '')
                this.clear()
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
            setTasks(done) {
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

                    if (done) {
                        done()
                    }
                })
            },
            setColorForCategory() {
                if (this.newColor === '') {
                    return
                }

                let savedCats = JSON.parse(localStorage.getItem(cfg.lsKey.categoriesColors) ?? '[]')
                let existing = savedCats.find((i) => i.name === this.colorCategory)
                let item = {
                    name: this.colorCategory,
                    color: this.newColor,
                }

                if (existing === undefined) {
                    savedCats.push(item)
                } else {
                    for (let i = 0; i < savedCats.length; ++i) {
                        if (savedCats[i].name === this.colorCategory) {
                            savedCats[i].color = this.newColor
                            break
                        }
                    }
                }

                localStorage.setItem(cfg.lsKey.categoriesColors, JSON.stringify(savedCats))
                this.newColor = ''
                this.addCategoryColor(item)
            },
        },
    }
</script>

<style scoped>
    #bottom-spacer {
        padding-bottom: 90px;
    }
    @media (min-width: 992px) {
        #bottom-spacer {
            padding-bottom: 300px;
        }
    }
    .row a {
        color: #000000;
        text-decoration: none;
    }
    .task-container {
        padding-left: 10px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: stretch;
    }
    @media (min-width: 992px) {
        .task-container {
            padding-left: 10px;
            background-color: #fff;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: flex-start;
            align-content: stretch;
        }
    }
    .task-list {
        flex: 0 1 auto;
        align-self: stretch;
    }
    .task-title {
        border: 1px solid #bbc;
        margin: 5px 0 0 0;
        border-radius: 20px;
        padding: 5px 10px;
        font-size: 16px;
        flex: 1 1 auto;
        align-self: auto;
    }
    .task-row-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: stretch;
        margin-top: 15px;
    }
    .btn-done {
        flex: 0 1 auto;
        align-self: center;
        margin: 0 10px;
    }
    .btn-add-container {
        text-align: center;
    }
</style>
