<template>
    <q-page id="detail-container"  class="col">

        <div class="q-pa-md">
            <q-input
                label="Title"
                :dense="false"
                v-model="task.Title"
                autofocus
                @keyup.enter="prompt = false" />
        </div>
        <div class="q-pa-md">
            <q-input
                label="Comment"
                v-model="task.Comment"
                filled
                type="textarea"
            />
        </div>
        <div id="categories-container">
            <p :key="category" v-for="category in categories">
                <q-radio v-model="task.Category" :val="category.name" :label="category.name" />
            </p>
        </div>
        <div id="button-container">
            <q-btn color="primary" :label="buttonTitle" @click="update()" />
        </div>
        <div class="bottom-spacer"></div>
    </q-page>
</template>

<script>
    import {mapGetters} from "vuex";
    import cfg from "../config";
    import firebase from "firebase";
    import {v4 as uuidv4} from "uuid";

    export default {
        name: "TaskDetail",

        data() {
            return {
                task: {},
                currentListName: '',
                db: null,
                isUpdate: false,
                buttonTitle: '',
            }
        },
        created() {
            this.db = firebase.database();

            if (!this.$route.params.id) {
                this.task.Uid  = ''
                this.task.Title  = ''
                this.task.Comment  = ''
                this.task.Category = cfg.noCategory
                this.buttonTitle = 'Create'
            } else {
                this.buttonTitle = 'Update'
                this.task = this.tasks.find(item => item.Uid === this.$route.params.id)
            }

            // list name for nav
            let taskList = localStorage.getItem(cfg.lsKey.taskList)

            if (taskList !== null && taskList !== undefined) {
                this.currentListName = taskList
            }
        },
        computed: {
            ...mapGetters("task_list", {
                tasks: "tasks",
            }),
            ...mapGetters("common", {
                listFullName: "listName",
                categories: "categories",
            }),
            isButtonDisabled: () => {
                // return this.task.Title === ''
                // || this.task.Category === ''
            },
        },
        methods: {
            update() {
                if (this.task.Uid !== '') {
                    this.db.ref(this.listFullName + '/' + this.task.Uid).set(this.task).then(() => {
                        this.$router.go(-1)
                    })
                } else {
                    let username = localStorage.getItem(cfg.lsKey.login)
                    let uid = uuidv4()
                    let task = {
                        Author: username,
                        Comment: this.task.Comment,
                        Timestamp: new Date().toISOString(),
                        AuthorUid: '',
                        Category: this.task.Category,
                        Title: this.task.Title,
                        Uid: uid,
                    }
                    this.db.ref(this.listFullName + '/' + uid).set(task).then(() => {
                        this.$router.go(-1)
                    })
                }
            },
        }
    }
</script>

<style scoped>
    #detail-container {
        text-align: center;
    }

    #categories-container {
        text-align: left;
        margin-left: 30px;
    }

    #button-container {
        margin-top: 30px;
    }
</style>
