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

                <q-toolbar-title>Shared Task List</q-toolbar-title>
            </q-toolbar>
        </q-header>

        <aside id="space-panel">
            <div style="position: fixed; width: 100px">
                <div id="space-panel-spacer"></div>
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/tasks">
                        <q-btn class="vertical-icon" round flat color="white" icon="list">
                            <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                                <strong>Task List</strong>
                            </q-tooltip>
                        </q-btn>
                    </router-link>
                </q-toolbar-title>
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/categories">
                        <q-btn class="vertical-icon" round flat color="white" icon="category">
                            <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                                <strong>Categories</strong>
                            </q-tooltip>
                        </q-btn>
                    </router-link>
                </q-toolbar-title>
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/settings">
                        <q-btn class="vertical-icon" round flat color="white" icon="settings">
                            <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                                <strong>Settings</strong>
                            </q-tooltip>
                        </q-btn>
                    </router-link>
                </q-toolbar-title>
            </div>
        </aside>

        <q-drawer
            :class="{ 'drawer': $q.platform.is.desktop }"
            v-model="leftDrawerOpen"
            show-if-above
            bordered
            content-class="bg-grey-1"
            v-if="lastLists.length > 0"
        >
            <q-list separator>
                <q-item-label header class="text-grey-8">Last Lists</q-item-label>
                <q-item clickable v-ripple v-for="list in lastLists" :key="list.name">
                    <q-item-section @click="openLastList(list)">{{ list.name }}</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container style="width: 100%;">
            <router-view />
        </q-page-container>

        <!-- back button -->
        <span v-if="this.showBackButton = $q.platform.is.ios || $q.platform.is.electron">
            <q-page-sticky
                class="bottom-btn"
                v-show="!disallowBackRoutes.includes($router.currentRoute.fullPath)"
                position="bottom-right"
                :offset="[18, 18]"
            >
                <q-btn fab @click="back" external-label color="primary" icon="arrow_back" />
            </q-page-sticky>
        </span>

        <q-footer elevated id="footer">
            <q-toolbar id="toolbar">
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/tasks">
                        <q-btn round flat color="white" icon="list" />
                    </router-link>
                </q-toolbar-title>
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/categories">
                        <q-btn round flat color="white" icon="category" />
                    </router-link>
                </q-toolbar-title>
                <q-toolbar-title class="toolbar-item">
                    <router-link to="/settings">
                        <q-btn round flat color="white" icon="settings" />
                    </router-link>
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import cfg from "src/config";
import firebase from "firebase";

export default {
    name: "MainLayout",

    data() {
        return {
            leftDrawerOpen: false,
            showBackButton: true,
            disallowBackRoutes: [
                '/categories',
                '/tasks',
                '/login',
                '/settings',
            ]
        };
    },
    mounted() {},
    computed: {
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
            clear: "clear"
        }),
        openLastList(list) {
            let db = firebase.database();

            if (window.innerWidth < 992) {
                this.leftDrawerOpen = false;
            }

            localStorage.setItem(cfg.lsKey.lastList, list.hash);
            localStorage.setItem(cfg.lsKey.taskList, list.name);
            this.setListName(list.hash);

            let route = this.$router.currentRoute;

            db.ref(list.hash).once("value", snapshot => {
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
        back() {
            this.$router.go(-1);
        }
    }
};
</script>

<style>
#main-layout {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}
#space-panel {
    visibility: hidden;
}
#space-panel-spacer {
    width: 50px;
    height: 50px;
    background-color: #fff;
    margin: 5px 0 20px 7px;
    border-radius: 25px;
}
#footer {
    position: fixed;
    bottom: 0;
}
#toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: flex-start;
    align-content: stretch;
}
#footer {
    visibility: visible;
}
.toolbar-item {
    flex: 0 1 auto;
    align-self: stretch;
}
.vertical-icon {
    margin: 10px 0;
}
#space-panel {
    width: 0;
}

@media (min-width: 992px) {
    .q-header {
        left: 65px;
    }
    .drawer aside {
        left: 68px;
    }
    #space-panel {
        width: 70px;
        max-width: 70px;
        min-width: 70px;
        background: #303b44;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: start;
        align-items: flex-start;
        align-content: stretch;
        visibility: visible;
    }
    #footer {
        visibility: hidden;
    }
}
</style>
