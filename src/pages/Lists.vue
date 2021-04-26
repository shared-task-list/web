<template>
    <q-page>
        <br>
<!--        <h4>Lists</h4>-->
        <q-list>
            <q-item clickable v-ripple class="q-my-sm" v-for="list in lastLists" :key="list.name" @click="openLastList(list)">
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">{{ list.name[0] }}</q-avatar>
                </q-item-section>

                <q-item-section>
                    {{ list.name }}
                </q-item-section>

                <q-item-section side>
                    <span v-if="list.name === currentList">current</span>
                </q-item-section>

                <!--<q-item-section side>
                    <q-btn flat round color="primary" icon="edit" @click="showEditList(list.name)" />
                </q-item-section>-->

                <!--<q-item-section side>
                    <q-btn class="delete-btn"
                            flat
                            round
                            color="primary"
                            icon="delete"
                            @click="showConfirmDelete(list.name)"
                    />
                </q-item-section>-->
            </q-item>
        </q-list>
        <div class="bottom-spacer"></div>

        <!-- add button -->
        <!--<div class="q-mt-md" id="control-buttons" :class="{
            'control-buttons-bottom-ios': $q.platform.is.ios,
            'control-buttons-bottom': !$q.platform.is.ios,
        }">
            <q-btn
                vertical-actions-align="left"
                label-position="left"
                color="primary"
                icon="add"
                round
                size="19px"
                @click="isShowAddList = true"
            ></q-btn>
        </div>-->

        <!-- add list modal-->
        <q-dialog v-model="isShowAddList">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New List</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newList" autofocus />
                    <q-input dense v-model="newList" autofocus />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                        flat
                        label="Add List"
                        v-close-popup
                        @click="addNewList"
                        :disabled="newList.length === 0"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- edit category modal-->
        <q-dialog v-model="isShowEditList">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New List Name</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newListName" autofocus />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                        flat
                        label="Update"
                        v-close-popup
                        @click="editList"
                        :disabled="newListName.length === 0"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- confirm delete dialog -->
        <q-dialog v-model="confirmDelete">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete" color="primary" text-color="white" />
                    <span id="confirm-header" class="text-h6">Delete {{ deletedList }}</span>
                </q-card-section>
                <q-card-section class="row items-center">
                    <span class="q-ml-sm">
                        All tasks in list {{ deletedList }} will be deleted
                    </span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                    <q-btn flat label="Delete" color="primary" @click="deleteList" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import firebase from "firebase";
import "firebase/database";
import {sha256} from "js-sha256";
import {v4 as uuidv4} from "uuid";
import {fromByteArray} from "base64-js";
import cfg from "src/config";

export default {
    name: "Lists",
    data() {
        return {
            db: null,
            isShowAddList: false,
            isShowEditList: false,
            confirmDelete: false,
            newList: "",
            chosenList: "",
            deletedList: "",
            listForEdit: "",
            newListName: "",
        };
    },
    mounted() {
        // init firebase database
        this.db = firebase.database();
    },
    computed: {
        ...mapGetters("common", {
            currentList: "currentList",
            listName: "listName"
        }),
        ...mapGetters("login", {
            lastLists: "lastLists"
        })
    },
    methods: {
        ...mapActions("common", {
            setListName: "setListName",
            setCategories: "setCategories"
        }),
        ...mapActions("task_list", {
            loadTasks: "loadTasks",
            clear: "clear",
            removeTask: "removeTask"
        }),
        deleteList() {
            this.removeCategory(this.deletedList);

            if (this.taskMap.get(this.deletedList)) {
                for (const task of this.taskMap.get(this.deletedList)) {
                    this.deleteTask(task);
                }
            }

            this.$q.notify({
                message: `List '${this.deletedList}' and all tasks is deleted`,
                color: "black"
            });
            this.deletedList = "";
            this.confirmDelete = false
        },
        deleteTask(task) {
            this.removeTask(task);
            this.db.ref(this.listName + "/" + task.Uid).set(null);
        },
        checkExist(closure) {
            const hash = sha256.create()
            hash.update(this.password)
            let df = fromByteArray(hash.digest())
            let listHash = this.taskList + df

            this.db.ref(listHash).once('value').then((snapshot) => {
                const isExistList = snapshot.val() !== null && snapshot.val() !== undefined

                if (isExistList) {
                    this.setListName(listHash)
                    this.addNewLastList(listHash)
                    localStorage.setItem(cfg.lsKey.lastList, listHash)
                }

                closure(isExistList)
            })
        },
        addNewList() {
            // event.preventDefault()
            this.checkExist((isExistList) => {
                if (isExistList) {
                    this.$q.notify({
                        type: 'negative',
                        message: 'Task List already exist'
                    })
                    return
                }
                const hash = sha256.create()
                hash.update(this.password)
                this.db.ref(this.taskList + hash.hex()).push().set({
                    Author: 'Admin',
                    Comment: 'service task',
                    Timestamp: new Date().toISOString(),
                    AuthorUid: null,
                    Category: null,
                    Title: null,
                    Uid: uuidv4(),
                }).then(function () {
                    this.$router.replace({ path: 'tasks', replace: true })
                })
            })
        },
        // editList() {
            // for (let task of this.taskMap.get(this.listForEdit)) {
            //     let updTask = { ...task }
            //     updTask.Category = this.newListName;
            //     console.log(updTask)
            //     this.db.ref(this.listName + "/" + task.Uid).set(updTask);
            // }
            // this.updateCategory({oldName: this.listForEdit, newName: this.newListName})
            // this.removeCategory(this.listForEdit);
            // this.$q.notify({
            //     message: `Category '${this.listForEdit}' is updated`,
            //     color: "black"
            // });
            // this.listForEdit = '';
            // this.newListName = '';
        // },
        showEditList(category) {
            this.listForEdit = category;
            this.newListName = category;
            this.isShowEditList = true;
        },
        showConfirmDelete(list) {
            this.deletedList = list;
            this.confirmDelete = true;
        },
        openLastList(list) {
            localStorage.setItem(cfg.lsKey.lastList, list.hash);
            localStorage.setItem(cfg.lsKey.taskList, list.name);
            this.setListName(list.hash);

            const route = this.$router.currentRoute;

            this.db.ref(list.hash).once("value", snapshot => {
                this.clear();
                let tasks = [];
                snapshot.forEach(childSnapshot => {
                    if (childSnapshot.val().Comment !== "service task") {
                        tasks.push(childSnapshot.val());
                    }
                });
                this.setCategories(tasks);
                this.loadTasks(tasks);

                if (route.path !== "/tasks") {
                    this.$router.replace({ path: "tasks", replace: true });
                }
            });
        },
    }
};
</script>

<style scoped>
/* tablet | phone */
#confirm-header {
    padding-left: 15px;
}
#control-buttons {
    position: fixed;
    right: 10px;
}
.control-buttons-bottom {
    bottom: 60px;
}
.control-buttons-bottom-ios {
    bottom: 75px;
}
.delete-btn {
    z-index: 999;
}


/* monitor */
@media (min-width: 992px) {
    #control-buttons {
        bottom: 10px !important;
    }
}
</style>
