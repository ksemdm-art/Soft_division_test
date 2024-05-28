<template>
    <v-container>
        <h1>Employees</h1>
        <v-data-table :headers="headers" :items="employees"  :loading="loading">
            <template v-slot:item.actions="{ item }">
                <v-btn color="primary" :to="`/employee/view/${item.id}`">View</v-btn>
                <v-btn color="warning" :to="`/employee/edit/${item.id}`">Edit</v-btn>
                <v-btn color="error" @click="deleteEmployee(item.id)">Delete</v-btn>
            </template>
        </v-data-table>
        <v-btn color="success" to="/employee/new">Add Employee</v-btn>
    </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    data() {
        return {
            headers: [
                { text: 'Фамилия', value: 'surname' },
                { text: 'Имя', value: 'name' },
                { text: 'Отчетсво', value: 'patronymic' },
                { text: 'Email', value: 'email' },
                { text: 'Друзья', value: 'friends.length' },
                { text: 'Действия', value: 'actions', sortable: false }
            ],
            loading: false
        }
    },
    computed: {
        ...mapState(['employees', 'currentEmployee']),
    },
    methods: {
        ...mapActions(['deleteEmployee', 'getEmployeeById']),
    }
}
</script>

