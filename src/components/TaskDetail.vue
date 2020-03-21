<template>
    <div id="detail-container">
        <div>
            <nav>
                <div class="nav-wrapper">
                    <a href="" class="brand-logo">{{ this.currentListName }}</a>
                </div>
            </nav>
        </div>
        <div style="margin-left: 10px;margin-right: 10px">
            <div class="input-field">
                <input required
                       v-model="task.Title"
                       type="text"
                       class="validate"
                       id="task-list">
                <!--                <label for="task-list">Title</label>-->
            </div>
        </div>
        <div class="row">
            <form class="col s12">
                <div class="row">
                    <div class="input-field col s12">
                    <textarea id="textarea1" class="materialize-textarea" v-model="task.Comment">
                    </textarea>
                        <label for="textarea1">Comment</label>
                    </div>
                </div>
            </form>
        </div>
        <div id="categories-container">
            <p :key="category" v-for="category in categories">
                <label>
                    <input name="group1"
                           type="radio"
                           :checked="task.Category === category"
                           @click="task.Category = category"/>
                    <span>{{ category }}</span>
                </label>
            </p>
        </div>
        <div id="button-container">
            <button type="submit"
                    class="btn btn-outline-primary"
                    @click="update($event)"
                    :disabled="isButtonDisabled">
                Update
            </button>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";
    import cfg from "../config";
    import firebase from "firebase";

    export default {
        name: "TaskDetail",

        data() {
            return {
                task: {},
                currentListName: '',
                db: null,
            }
        },
        created() {
            this.db = firebase.database();
            this.task = this.tasks.find(item => item.Uid === this.$route.params.id)

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
                listName: "listName",
                categories: "categories",
            }),
            isButtonDisabled: () => {
                // return this.task.Title === ''
                // || this.task.Category === ''
            }
        },
        methods: {
            update(event) {
                this.db.ref(this.listName + '/' + this.task.Uid).set(this.task).then(() => {
                    this.$router.go(-1)
                })
            }
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
