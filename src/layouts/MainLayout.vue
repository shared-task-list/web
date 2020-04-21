<template>
    <q-layout view="lHh Lpr lFf">
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

                <!--        <div>Quasar v{{ $q.version }}</div>-->
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
    </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink'
import {mapActions, mapGetters} from "vuex";
import cfg from "src/config";
import firebase from "firebase";

export default {
    name: 'MainLayout',

    components: {
        EssentialLink
    },

    data() {
        return {
            leftDrawerOpen: false,
        }
    },
    computed: {
        ...mapGetters("login", {
            lastLists: "lastLists",
        }),
    },
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
            this.leftDrawerOpen = false
            localStorage.setItem(cfg.lsKey.lastList, list.hash)
            localStorage.setItem(cfg.lsKey.taskList,  list.name)
            this.setListName(list.hash)
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
            })
        }

    }
}
</script>
