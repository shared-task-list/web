<template>
    <q-page>
        <q-list>
            <q-item class="q-my-sm" v-for="cat in categories" :key="cat.name">
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">{{ cat.name[0] }}</q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ cat.name }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn flat round color="primary" icon="edit" @click="showEditCategory(cat.name)" />
                </q-item-section>

                <q-item-section side>
                    <q-btn
                        flat
                        round
                        color="primary"
                        icon="delete"
                        @click="showConfirmDelete(cat.name)"
                    />
                </q-item-section>
            </q-item>
        </q-list>

        <!-- add button -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <div class="q-mt-md">
                <q-btn
                    vertical-actions-align="left"
                    label-position="left"
                    color="primary"
                    icon="add"
                    round
                    size="18px"
                    @click="isShowAddCategory = true"
                ></q-btn>
            </div>
        </q-page-sticky>

        <!-- add category modal-->
        <q-dialog v-model="isShowAddCategory">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New Category</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newCategory" autofocus />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                        flat
                        label="Add category"
                        v-close-popup
                        @click="addNewCategory"
                        :disabled="newCategory.length === 0"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- edit category modal-->
        <q-dialog v-model="isShowEditCategory">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">New Category</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense v-model="newCatName" autofocus />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                        flat
                        label="Update"
                        v-close-popup
                        @click="editCategory"
                        :disabled="newCatName.length === 0"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- confirm delete dialog -->
        <q-dialog v-model="confirmDelete">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete" color="primary" text-color="white" />
                    <span id="confirm-header" class="text-h6">Delete {{ deletedCategory }}</span>
                </q-card-section>
                <q-card-section class="row items-center">
                    <span
                        class="q-ml-sm"
                    >All tasks in category {{ deletedCategory }} will be deleted</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                    <q-btn flat label="Delete" color="primary" @click="deleteCategory" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import firebase from "firebase";
import "firebase/database";

export default {
    name: "CategoryList",
    data() {
        return {
            db: null,
            isShowAddCategory: false,
            isShowEditCategory: false,
            confirmDelete: false,
            newCategory: "",
            chosenCategory: "",
            deletedCategory: "",
            catForEdit: "",
            newCatName: "",
        };
    },
    mounted() {
        // init firebase database
        this.db = firebase.database();
    },
    computed: {
        ...mapGetters("common", {
            categories: "categories",
            listName: "listName"
        }),
        ...mapGetters("task_list", {
            tasks: "tasks",
            taskMap: "taskMap"
        })
    },
    methods: {
        ...mapActions("common", {
            addCategory: "addCategory",
            removeCategory: "removeCategory",
            updateCategory: "updateCategory"
        }),
        ...mapActions("task_list", {
            removeTask: "removeTask"
        }),
        deleteCategory() {
            this.removeCategory(this.deletedCategory);

            if (this.taskMap.get(this.deletedCategory)) {
                for (const task of this.taskMap.get(this.deletedCategory)) {
                    this.deleteTask(task);
                }
            }

            this.$q.notify({
                message: `Category '${this.deletedCategory}' and all tasks is deleted`,
                color: "black"
            });
            this.deletedCategory = "";
        },
        deleteTask(task) {
            this.removeTask(task);
            this.db.ref(this.listName + "/" + task.Uid).set(null);
        },
        addNewCategory() {
            this.addCategory(this.newCategory);
            this.$q.notify({
                message: `Category '${this.newCategory}' is added`,
                color: "black"
            });
            this.newCategory = "";
        },
        editCategory() {
            for (let task of this.taskMap.get(this.catForEdit)) {
                let updTask = { ...task }
                updTask.Category = this.newCatName;
                console.log(updTask)
                this.db.ref(this.listName + "/" + task.Uid).set(updTask);
            }
            this.updateCategory({oldName: this.catForEdit, newName: this.newCatName})
            this.removeCategory(this.catForEdit);
            this.$q.notify({
                message: `Category '${this.catForEdit}' is updated`,
                color: "black"
            });
            this.catForEdit = '';
            this.newCatName = '';
        },
        showEditCategory(category) {
            this.catForEdit = category;
            this.newCatName = category;
            this.isShowEditCategory = true;
        },
        showConfirmDelete(category) {
            this.deletedCategory = category;
            this.confirmDelete = true;
        }
    }
};
</script>

<style scoped>
#confirm-header {
    padding-left: 15px;
}
</style>
