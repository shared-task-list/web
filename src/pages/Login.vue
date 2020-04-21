<template>
    <div>
        <p></p>
        <div id="form-container" class="row">
            <form action="" class="col s12 m3 offset-m4">
                <div>
                  <q-input outlined bottom-slots v-model="login" label="Login" :rules="[val => !!val || 'Field is required']">
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="close" @click="login = ''" class="cursor-pointer" />
                    </template>
                  </q-input>
                </div>
                <div>
                  <q-input outlined bottom-slots v-model="taskList" label="Task List" :rules="[val => !!val || 'Field is required']">
                    <template v-slot:prepend>
                      <q-icon name="list" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="close" @click="taskList = ''" class="cursor-pointer" />
                    </template>
                  </q-input>
                </div>
                <div>
                    <div class="input-field">
                      <q-input v-model="password" type="password" outlined bottom-slots label="Password" :rules="[val => !!val || 'Field is required']">
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                        <template v-slot:append>
                          <q-icon name="close" @click="password = ''" class="cursor-pointer" />
                        </template>
                      </q-input>
                    </div>
                </div>
                <div id="button-container">
                    <div>
                      <q-btn unelevated rounded color="primary" label="Open" @click="openList($event)" :disabled="isButtonDisabled" />
                    </div>
                  <q-btn unelevated rounded color="primary" label="Create" @click="createList($event)" :disabled="isButtonDisabled" />
                </div>
            </form>
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
    import cfg from '../config'


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

            let username = localStorage.getItem(cfg.lsKey.login)
            let taskList = localStorage.getItem(cfg.lsKey.taskList)
            let lastList = localStorage.getItem(cfg.lsKey.lastList)

            if (lastList !== 'null' && lastList !== '' && lastList !== null) {
                this.setListName(lastList)
                this.$router.replace({ path: 'tasks', replace: true })
                return
            }
            if (username !== 'null' && username !== '' && username !== null) {
                this.login = username
            }
            if (taskList !== 'null' && taskList !== '' && taskList !== null) {
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
                        localStorage.setItem(cfg.lsKey.lastList, listHash)
                    }

                    closure(isExistList)
                })
            },
            createList(event) {
                event.preventDefault()
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
            openList(event) {
                event.preventDefault()
                this.checkExist((isExistList) => {
                    if (isExistList) {
                        localStorage.setItem(cfg.lsKey.login, this.login)
                        localStorage.setItem(cfg.lsKey.taskList,  this.taskList)
                        this.$router.replace({ path: 'tasks', replace: true })
                    } else {
                        this.$q.notify({
                            type: 'negative',
                            message: `Invalid Login or Password`
                        })
                    }
                })
            },
            addNewLastList(listHash) {
                let item = {
                    name: this.taskList,
                    hash: listHash,
                    date: new Date().getTime()
                }
                this.addLastList(item)
            },
            openLastList(list) {
                localStorage.setItem(cfg.lsKey.lastList, list.hash)
                localStorage.setItem(cfg.lsKey.taskList,  list.name)
                this.setListName(list.hash)
                this.$router.replace({ path: 'tasks', replace: true })
            }
        },
    }
</script>

<style scoped>
    #form-container {
        margin: 0 40px;
    }
    #button-container {
        text-align: center;
    }
    #button-container button {
      width: 200px;
      margin-bottom: 20px;
    }
</style>
