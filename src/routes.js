import Vue from 'vue';
import VueRouter from 'vue-router';

import TaskList from "./components/TaskList";
import Login from "./components/Login";
import TaskDetail from "./components/TaskDetail";


Vue.use(VueRouter);

const routes = [
    {
        name: 'taskList',
        path: '/tasks',
        component: TaskList
    },
    {
        name: 'taskDetail',
        path: '/tasks/:id',
        component: TaskDetail
    },
    {
        name: 'create',
        path: '/tasks/create',
        component: TaskDetail
    },
    {
        path: '/login',
        component: Login
    },
]

export const router = new VueRouter({
    routes: routes,
    mode: 'history'
});
