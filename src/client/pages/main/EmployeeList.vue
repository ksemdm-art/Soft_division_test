<template>
    <v-container>
        <h1>Сотрудники</h1>
        <v-data-table :headers="headers" :items="employees" :loading="loading">
            <template v-slot:item.actions="{ item }">
                <v-btn color="primary" :to="`/employee/${item.id}`">Показать информацию</v-btn>
                <v-btn color="warning" @click="editEmployee(item)">Редактировать</v-btn>
                <v-btn color="error" @click="deleteEmployee(item)">Удалить</v-btn>
            </template>
        </v-data-table>
        <v-btn color="success" to="/employee/new">Добавить сотрудника</v-btn>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            headers: [
                { text: 'Фамилия', value: 'surname' },
                { text: 'Имя', value: 'name' },
                { text: 'Отчество', value: 'patronymic' },
                { text: 'Email', value: 'email' },
                { text: 'Друзья', value: 'friendCount' },
                { text: 'Действия', value: 'actions', sortable: false }
            ],
            employees: [],
            loading: true
        }
    },
    created() {
        this.fetchEmployees()
    },
    methods: {
        fetchEmployees() {
            this.employees = [
                { id: 1, surname: 'Doe', name: 'John', patronymic: 'Doe', email: 'john.doe@example.com', friendCount: 2 },
                { id: 2, surname: 'Smith', name: 'Jane', patronymic: 'Smith', email: 'jane.smith@example.com', friendCount: 1 },
                { id: 3, surname: 'Johnson', name: 'Bob', patronymic: 'Johnson', email: 'bob.johnson@example.com', friendCount: 3 }
            ]
            this.loading = false
        },
        editEmployee(employee) {
            this.$router.push(`/employee/${employee.id}`)
        },
        deleteEmployee(employee) {
            this.employees = this.employees.filter(e => e.id !== employee.id)
        }
    }
}
</script>