<template>
    <q-item clickable>
        <q-item-section avatar>
            <q-icon name="list"/>
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ title }}</q-item-label>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'EssentialLink',
    props: {
        title: {
            type: String,
            required: true
        },
    }
}
</script>
