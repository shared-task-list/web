<template>
    <div>
        <div id="logo-container">
            <img id="logo" alt="Vue logo" src="../assets/logo.png">
        </div>

        <div id="form-container" class="row">
            <form action="" class="col s12 m3 offset-m4">
                <div>
                    <div v-show="isShowAlert" class="alert alert-danger" role="alert">
                        {{ alertText }}
                    </div>
                    <div class="input-field">
                        <i class="material-icons prefix">person</i>
                        <input required
                               v-model="login"
                               v-bind:class="{'is-valid': login.length > 0}"
                               type="text"
                               class="validate"
                               id="username">
                        <label for="username">Login</label>
                    </div>
                </div>
                <div>
                    <div class="input-field">
                        <i class="material-icons prefix">list</i>
                        <input required
                               v-model="taskList"
                               v-bind:class="{'is-valid': taskList.length > 0}"
                               type="text"
                               class="validate"
                               id="task-list">
                        <label for="task-list">Task list</label>
                    </div>
                </div>
                <div>
                    <div class="input-field">
                        <i class="material-icons prefix">lock</i>
                        <input required
                               v-model="password"
                               v-bind:class="{'is-valid': password.length > 0}"
                               type="password"
                               class="validate"
                               id="passwd">
                        <label for="passwd">Password</label>
                    </div>
                </div>
                <div id="button-container">
                    <div>
                        <button type="submit"
                                class="btn btn-outline-primary"
                                @click="openList($event)"
                                :disabled="isButtonDisabled">
                            Open
                        </button>
                    </div>
                    <button type="submit"
                            class="btn btn-outline-primary"
                            @click="createList($event)"
                            :disabled="isButtonDisabled">
                        Create
                    </button>
                </div>
            </form>
        </div>
        <div class="row">
            <div id="last-lists-container" v-if="lastLists.length > 0" class="col s12 m3 offset-m4">
                <hr/>
                <h5>
                    Last Lists
                </h5>
                <div id="last-lists" :key="index" v-for="(list, index) in lastLists">
                    <div class="row">
                        <div class="task-title col s10 m10" @click="openLastList(list)">
                            {{ list.name }}
                        </div>
                        <a class="btn-floating btn-small waves-effect waves-light red" @click="removeList(list)">
                            <i class="material-icons">delete</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase/app';
    import 'firebase/database';
    import { sha256 } from 'js-sha256';
    import { fromByteArray } from 'base64-js'
    import { mapActions, mapGetters } from "vuex";
    import { v4 as uuidv4 } from 'uuid'


    export default {
        name: "Login",
        data() {
            return {
                login: '',
                taskList: '',
                password: '',
                db: null,
                isExistList: false,
                isShowAlert: false,
                alertText: ''
            }
        },
        mounted() {
            this.loadLastLists()
            this.db = firebase.database()

            let username = localStorage.getItem('login')
            let taskList = localStorage.getItem('taskList')
            let lastList = localStorage.getItem('lastList')

            if (lastList !== 'null' && lastList !== null && lastList !== undefined) {
                this.setListName(lastList)
                this.$router.push({ path: 'tasks' })
                return
            }
            if (username !== 'null' && username !== null && username !== undefined) {
                this.login = username
            }
            if (taskList !== 'null' && taskList !== null && taskList !== undefined) {
                this.taskList = taskList
            }

            this.loadLastLists()
        },
        computed: {
            ...mapGetters("login", {
                lastLists: "lastLists",
            }),
            isButtonDisabled: function() {
                return this.login.length === 0
                    || this.taskList.length === 0
                    || this.password.length === 0
            },
        },
        methods: {
            ...mapActions("login", {
                loadLastLists: "loadLastLists",
                removeList: "removeList",
                addLastList: "addLastList",
            }),
            ...mapActions("common", {
                setListName: "setListName",
            }),
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
                        localStorage.setItem('lastList', listHash)
                    }

                    closure(isExistList)
                })
            },
            createList(event) {
                event.preventDefault()
                this.checkExist((isExistList) => {
                    if (isExistList) {
                        this.alertText = 'Task List already exist'
                        this.isShowAlert = true;
                        setTimeout( () => this.isShowAlert = false,  3000)
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
                        this.$router.push({ path: 'tasks' })
                    })
                })
            },
            openList(event) {
                event.preventDefault()
                this.checkExist((isExistList) => {
                    if (isExistList) {
                        localStorage.setItem('login', this.login)
                        localStorage.setItem('taskList',  this.taskList)
                        this.$router.push({ path: 'tasks' })
                    } else {
                        this.alertText = 'Invalid Login or Password'
                        this.isShowAlert = true;
                        setTimeout( () => this.isShowAlert = false,  3000)
                    }
                })
            },
            addNewLastList(listHash) {
                let item = {
                    name: this.taskList,
                    hash: listHash,
                    date:new Date().getTime()
                }
                this.addLastList(item)
            },
            openLastList(list) {
                localStorage.setItem('lastList', list.hash)
                localStorage.setItem('taskList',  list.name)
                this.setListName(list.hash)
                this.$router.push({ path: 'tasks' })
            }
        },
    }
</script>

<style scoped>
    #form-container {
        margin: 0 40px;
    }
    #logo-container {
        padding-top: 20px;
        /*padding-right: 40px;*/
        text-align: center;
    }
    #logo {
        width: 200px;
        height: 200px;
    }
    #button-container {
        text-align: center;
    }
    #last-lists-container {
        /*margin: 0 20px;*/
    }
    #last-lists{
        margin-top: 20px;
    }
    .btn {
        width: 200px;
        margin-bottom: 20px;
    }
</style>
