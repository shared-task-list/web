// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex';
import VueRouter from 'vue-router'
import App from './App'

import { store } from './store';
import { router } from './routes.js';

Vue.config.productionTip = false

// Vue.use(Vuex);
// Vue.use(VueRouter)

/* eslint-disable no-new */

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
    store,
    router
})
/*

new Vue({
  render: h => h(App),
}).$mount('#app')
*/

// new Vue({
//   render: h => h(App),
//   store,
//   router,
// }).$mount('#app')
