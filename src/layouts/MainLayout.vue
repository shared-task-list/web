<template>
    <q-layout id="main-layout" view="hHh Lpr lff" class="shadow-2 rounded-borders">
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="leftDrawerOpen = !leftDrawerOpen"
                    v-if="lastLists.length > 0"
                />

                <q-toolbar-title>
                    Shared Task List
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            bordered
            content-class="bg-grey-1"
            v-if="lastLists.length > 0"
        >
            <q-list separator>
                <q-item-label header class="text-grey-8">
                    Last Lists
                </q-item-label>
                <q-item clickable v-ripple v-for="list in lastLists" :key="list.name">
                    <q-item-section @click="openLastList(list)">{{ list.name }}</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view/>
        </q-page-container>

        <!-- back button -->
        <span v-if="this.showBackButton = $q.platform.is.ios || $q.platform.is.electron">
            <q-page-sticky
                v-show="$router.currentRoute.fullPath !== '/tasks' && $router.currentRoute.fullPath !== '/login'"
                position="bottom-left"
                :offset="[18, 18]">
                <q-btn
                    fab
                    @click="back"
                    external-label
                    color="primary"
                    icon="arrow_back"
                />
            </q-page-sticky>
        </span>
    </q-layout>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import cfg from "src/config";
import firebase from "firebase";

export default {
    name: 'MainLayout',

    data() {
        return {
            leftDrawerOpen: false,
            showBackButton: true,
        }
    },
    mounted() {
    },
    computed: {
        ...mapGetters("login", {
            lastLists: "lastLists",
        }),
    },
    /*watch: {
        canWatch: () => {
            let path = this.$router.currentRoute.fullPath
            this.showBackButton = (this.$q.platform.is.ios || this.$q.platform.is.electron)
                && path !== '/tasks'
                && path !== '/login'
        },
    },*/
    methods: {
        ...mapActions("common", {
            setListName: "setListName",
            setCategories: "setCategories",
        }),
        ...mapActions("task_list", {
            loadTasks: "loadTasks",
            clear: "clear",
        }),
        openLastList(list) {
            let db = firebase.database();

            if (window.innerWidth < 992) {
                this.leftDrawerOpen = false
            }

            localStorage.setItem(cfg.lsKey.lastList, list.hash)
            localStorage.setItem(cfg.lsKey.taskList,  list.name)
            this.setListName(list.hash)

            let route = this.$router.currentRoute

            db.ref(list.hash).once('value', (snapshot) => {
                this.clear()
                let tasks = []
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val().Comment !== 'service task') {
                        tasks.push(childSnapshot.val())
                    }
                })
                this.setCategories(tasks)
                this.loadTasks(tasks)

                if (route.path !== '/tasks') {
                    this.$router.replace({ path: 'tasks', replace: true })
                }
            })
        },
        back() {
            this.$router.go(-1)
        }

    }
}
</script>
