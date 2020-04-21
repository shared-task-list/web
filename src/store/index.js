import Vue from 'vue'
import Vuex from 'vuex'

import common from "src/store/modules/common";
import login from "src/store/modules/login";
import task_list from "src/store/modules/task_list";
import settings from "src/store/modules/settings";

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
    const Store = new Vuex.Store({
        modules: {
            common,
            login,
            task_list,
            settings,
        },

        // enable strict mode (adds overhead!)
        // for dev mode only
        strict: process.env.DEV
    })

    return Store
}
