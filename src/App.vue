<template>
  <div id="app">
    <!--<header>
      <span>Vue.js PWA</span>
    </header>-->
    <main>
        <router-view></router-view>
    </main>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import Login from './components/Login'
import cfg from './config'


export default {
    name: 'app',
    beforeCreate() {
      const firebaseConfig = {
          apiKey: cfg.firebase.apiKey,
          authDomain: cfg.firebase.authDomain,
          databaseURL: cfg.firebase.databaseURL,
          storageBucket: cfg.firebase.storageBucket,
      }
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig)
    },
    mounted() {
        this.$router.push({ path: 'login' })
    },
    components: {
        Login
    }
}
</script>

<style>
    body {
        background-color: #ee6e73;
    }
    #app {
        background-color: #fff;
        height: 100vh;
    }
</style>
