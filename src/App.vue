<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
  import 'firebase/database';
  import firebase from 'firebase/app';
  import cfg from 'src/config'
  import {mapActions} from "vuex";

export default {
    name: 'App',
    beforeCreate() {
        const firebaseConfig = {
            apiKey: cfg.firebase.apiKey,
            authDomain: cfg.firebase.authDomain,
            databaseURL: cfg.firebase.databaseURL,
            storageBucket: cfg.firebase.storageBucket,
        }
        firebase.initializeApp(firebaseConfig)
    },
    mounted() {
        let lastList = localStorage.getItem(cfg.lsKey.lastList)
        this.loadLastLists()

        if (lastList !== 'null' && lastList !== '' && lastList !== null) {
            this.setListName(lastList)
            this.$router.replace({ path: 'tasks', replace: true })
            return
        }

        this.$router.replace({path: 'login', replace: true})
    },
    methods: {
        ...mapActions("login", {
            loadLastLists: "loadLastLists",
        }),
    }
}
</script>
