import Vue from 'vue';
import VueRouter from 'vue-router';

import TaskList from "./components/TaskList";
import Login from "./components/Login";


Vue.use(VueRouter);

const routes = [
    {
        path: '/tasks',
        component: TaskList
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
