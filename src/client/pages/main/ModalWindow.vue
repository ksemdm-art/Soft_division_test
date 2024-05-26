<template>
    <v-dialog v-model="visible" max-width="600px">
        <v-card>
            <v-card-title>Циклические связи {{ employee.fullName }}</v-card-title>
            <v-card-text>
                <p v-for="cycle in cycles" :key="cycle.id">
                    {{ cycle.employees.map(e => e.fullName).join(' добавил(а) ') }}
                </p>
                <p v-if="cycles.length === 0">Нет циклических связей</p>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" type="submit" @click="visible = false">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        employee: {
            type: Object,
            required: true
        },
        cycles: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            visible: false
        }
    },
    methods: {
        open() {
            this.visible = true
        }
    }
}
</script>