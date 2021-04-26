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
            <div id="logout-btn-container">
                <q-btn flat rounded color="red" label="Logout" @click="logout" />
            </div>
        </q-list>

        <!-- color dialog-->
        <q-dialog v-model="isShowColorPicker">
            <q-card id="color-dialog-card">
                <div id="color-preview-container">
                    <div id="new-color-preview" :style="{ background: newColor }"></div>
                    <span v-if="newColor !== ''">Selected Color</span>
                    <span v-if="newColor === ''">No Selected Color</span>
                </div>

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
                    <q-btn flat label="Set default" v-close-popup @click="setDefaultCategoryHandler" />
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
                // defaultCategory: '',
                isShowColorPicker: false,
                isShowDefaultCategory: false,
                isShowName: false,
                categoryForNewTask: '',
                groupOptions: [],
                newColor: '',
            }
        },
        mounted() {
            this.name = localStorage.getItem(cfg.lsKey.login)
            // this.defaultCategory = cfg.noCategory
            this.categoryForNewTask = this.defaultCategory
        },
        computed: {
            ...mapGetters('common', {
                categories: 'categories',
                bgColor: 'bgColor',
                showQuickAdd: 'showQuickAdd',
                defaultCategory: 'defaultCategory',
            }),
        },
        methods: {
            ...mapActions('common', {
                setBgColor: 'setBgColor',
                setShowQuickAdd: 'setShowQuickAdd',
                setDefaultCategory: 'setDefaultCategory',
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
                        label: cat.name,
                        value: cat.name,
                    })
                }

                this.isShowDefaultCategory = true
            },
            setName() {
                localStorage.setItem(cfg.lsKey.login, this.name)
            },
            setDefaultCategoryHandler() {
                this.setDefaultCategory(this.categoryForNewTask)
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
            logout() {

            }
        }
    }
</script>

<style scoped>
#logout-btn-container {
    margin-top: 30px;
    text-align: center;
    color: red;
    font-weight: bold;
    font-size: 20px;
}
#color-dialog-card {
    width: 350px;
}
#color-preview-container {
    height: 50px;
    display: flex;
    flex-direction: row;
}
#color-preview-container span {
    margin-top: 14px;
    margin-left: 10px;
}
#new-color-preview {
    height: 40px;
    width: 40px;
    border-radius: 20px;
    margin: 5px 0 5px 5px;
}
</style>
