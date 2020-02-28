import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import login from './modules/login'
import task_list from './modules/task_list'
import common from './modules/common'


export const store = new Vuex.Store({
    modules: {
        login,
        task_list,
        common,
    },
    strict: false
});
