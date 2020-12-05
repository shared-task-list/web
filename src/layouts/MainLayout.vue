<template>
    <q-layout id="main-layout" class="shadow-2 rounded-borders">

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
                    <router-link to="/lists">
                        <q-btn class="vertical-icon" round flat color="white" icon="view_list">
                            <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                                <strong>Lists</strong>
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

        <q-page-container style="width: 100%;">
            <router-view />
        </q-page-container>

        <!-- back button -->
        <span
            id="back-button"
            :class="{
                'control-buttons-bottom-ios': $q.platform.is.ios,
                'control-buttons-bottom': !$q.platform.is.ios,
            }"
            v-if="this.showBackButton = $q.platform.is.ios || $q.platform.is.electron"
            v-show="!disallowBackRoutes.includes($router.currentRoute.fullPath)"
        >
            <q-btn fab @click="back" external-label color="primary" icon="arrow_back" />
        </span>

        <q-footer elevated id="footer" :class="{ iosh: $q.platform.is.ios }">
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
                    <router-link to="/lists">
                        <q-btn round flat color="white" icon="view_list" />
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
                '/lists',
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
        back() {
            this.$router.go(-1);
        }
    }
};
</script>

<style>
/* tablet | phone */
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
    visibility: visible;
}
#toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: flex-start;
    align-content: stretch;
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
#back-button {
    position: fixed;
    right: 10px;
}
.control-buttons-bottom {
    bottom: 10px;
}
.control-buttons-bottom-ios {
    bottom: 75px;
}

.iosh {
    height: 65px !important;
}

/* monitor */
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
        visibility: collapse;
    }
}
</style>
