<template>
    <q-page :style="{ backgroundColor: bgColor }">
        <p></p>
        <q-list>
            <q-item clickable v-ripple>
                <q-item-section @click="showDefaultCategory">
                    <q-item-label :style="{ color: getTextColor(bgColor) }">Default Category</q-item-label>
                    <q-item-label caption>{{ defaultCategory }}</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
                <q-item-section @click="isShowName = true">
                    <q-item-label :style="{ color: getTextColor(bgColor) }">Name</q-item-label>
                    <q-item-label caption>{{ name }}</q-item-label>
                </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple @click="setShowQuickAdd">
                <q-item-section>
                    <q-item-label>Show Quick Add  Button</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                    <q-toggle color="blue" v-model="showQuickAdd" />
                </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="isShowColorPicker = true">
                <q-item-section :style="{ color: getTextColor(bgColor) }">Background</q-item-section>
            </q-item>
        </q-list>

        <!-- color dialog-->
        <q-dialog v-model="isShowColorPicker">
            <q-card style="min-width: 350px">
                <q-badge color="grey-3" text-color="black" class="q-mb-sm">
                    {{ newColor }}
                </q-badge>
                <q-color v-model="newColor" no-header class="my-picker" default-view="palette" />

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Set for background" v-close-popup @click="setNewBgColor" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- default category modal-->
        <q-dialog v-model="isShowDefaultCategory">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Default Category</div>
                </q-card-section>

                <div class="q-pa-lg">
                    <q-option-group
                        v-model="categoryForNewTask"
                        :options="groupOptions"
                        color="primary"
                    />
                </div>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Set default" v-close-popup @click="setDefaultCategory" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- set name modal-->
        <q-dialog v-model="isShowName">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Name</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="name" autofocus @keyup.enter="prompt = false" />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Set name" v-close-popup @click="setName" :disabled="name.length === 0" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-page>
</template>

<script>
    import cfg from "src/config";
    import {mapActions, mapGetters} from "vuex";
    import {hexToRgb} from "quasar/src/utils/colors";

    export default {
        name: "Settings",
        data() {
            return {
                name: '',
                defaultCategory: '',
                isShowColorPicker: false,
                isShowDefaultCategory: false,
                isShowName: false,
                categoryForNewTask: cfg.noCategory,
                groupOptions: [],
                newColor: '',
            }
        },
        mounted() {
            this.name = localStorage.getItem(cfg.lsKey.login)
            this.defaultCategory = cfg.noCategory
        },
        computed: {
            ...mapGetters('common', {
                categories: 'categories',
                bgColor: 'bgColor',
                showQuickAdd: 'showQuickAdd',
            }),
        },
        methods: {
            ...mapActions('common', {
                setBgColor: 'setBgColor',
                setShowQuickAdd: 'setShowQuickAdd',
            }),
            setNewBgColor() {
                if (this.newColor === '') {
                    return
                }

                this.setBgColor(this.newColor)
            },
            showDefaultCategory() {
                this.groupOptions = []

                for (let cat of this.categories)  {
                    this.groupOptions.push({
                        label: cat,
                        value: cat,
                    })
                }

                this.isShowDefaultCategory = true
            },
            setName() {
                localStorage.setItem(cfg.lsKey.login, this.name)
            },
            setDefaultCategory() {

            },
            getTextColor(color) { // TODO: to util
                if (color === undefined || color === null) {
                    return 'black'
                }

                const rgb = hexToRgb(color)
                const brightness = Math.round(((parseInt(rgb.r) * 299) +
                    (parseInt(rgb.g) * 587) +
                    (parseInt(rgb.b) * 114)) / 1000);

                return (brightness > 125) ? 'black' : 'white';
            },
        }
    }
</script>

<style scoped>

</style>
