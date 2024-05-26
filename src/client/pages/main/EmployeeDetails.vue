<template>
    <v-container>
        <h1>{{ isNew ? 'Добавить сотрудника' : 'Информация о сотруднике' }}</h1>
        <v-form @submit.prevent="saveEmployee">
            <v-text-field v-model="employee.surname" label="Фамилия" required></v-text-field>
            <v-text-field v-model="employee.name" label="Имя" required></v-text-field>
            <v-text-field v-model="employee.patronymic" label="Отчество" required></v-text-field>
            <v-text-field v-model="employee.email" label="Email" required></v-text-field>
            <h2>Friends</h2>
            <v-data-table :headers="friendHeaders" :items="employee.friends">
                <template v-slot:item.actions="{ item }">
                    <v-btn color="error" @click="removeFriend(item)">Удалить</v-btn>
                </template>
            </v-data-table>
            <v-autocomplete v-model="selectedFriend" :items="availableFriends" label="Добавить друга" item-text="fullName"
                item-value="id"></v-autocomplete>
            <v-btn color="primary" type="submit">Сохранить</v-btn>
            <v-btn color="error" @click="deleteEmployee">Удалить</v-btn>
            <v-btn color="info" @click="showCycles">Показать циклические связи</v-btn>
            <modal-window :employee="employee" ref="modalWindow" :cycles="cycles"></modal-window>
        </v-form>
    </v-container>
</template>

<script>
import ModalWindow from './ModalWindow.vue'

export default {

    components: {
        ModalWindow
    },
    data() {
        return {
            employee: {
                id: null,
                surname: '',
                name: '',
                patronymic: '',
                email: '',
                friends: []
            },
            selectedFriend: null,
            availableFriends: [
                { id: 1, surname: 'Doe', name: 'John', patronymic: 'Doe', fullName: 'John Doe Doe' },
                { id: 2, surname: 'Smith', name: 'Jane', patronymic: 'Smith', fullName: 'Jane Smith Smith' },
                { id: 3, surname: 'Johnson', name: 'Bob', patronymic: 'Johnson', fullName: 'Bob Johnson Johnson' }
            ],
            friendHeaders: [
                { text: 'Полное имя', value: 'fullName' },
                { text: 'Действия', value: 'actions', sortable: false }
            ],
            cycles: []
        }
    },
    computed: {
        isNew() {
            return this.$route.path === '/employee/new'
        }
    },
    created() {
        if (!this.isNew) {
            this.fetchEmployee(this.$route.params.id)
        }
    },
    methods: {
        fetchEmployee(id) {
            this.employee = {
                id: id,
                surname: 'Doe',
                name: 'John',
                patronymic: 'Doe',
                email: 'john.doe@example.com',
                friends: [
                    { id: 2, surname: 'Smith', name: 'Jane', patronymic: 'Smith', fullName: 'Jane Smith Smith' },
                    { id: 3, surname: 'Johnson', name: 'Bob', patronymic: 'Johnson', fullName: 'Bob Johnson Johnson' }
                ]
            }
        },
        saveEmployee() {
            if (this.isNew) {
                this.employee.id = Math.max(...this.availableFriends.map(f => f.id)) + 1
                this.availableFriends.push(this.employee)
            }
            this.$router.push('/')
        },
        removeFriend(friend) {
            this.employee.friends = this.employee.friends.filter(f => f.id !== friend.id)
        },
        addFriend() {
            if (this.selectedFriend) {
                const friend = this.availableFriends.find(f => f.id === this.selectedFriend)
                this.employee.friends.push(friend)
                this.selectedFriend = null
            }
        },
        deleteEmployee() {
            this.$router.push('/')
        },
        showCycles() {
            this.findCycles(this.employee)
            this.$refs.modalWindow.open()
        },

        findCycles(employee, visited = new Set(), path = []) {
            if (visited.has(employee.id)) {
                this.cycles.push({ id: this.cycles.length, employees: [...path, employee] })
                return
            }

            visited.add(employee.id)
            path.push(employee)

            for (const friend of this.employee.friends) {
                this.findCycles(friend, visited, path)
            }

            path.pop()
        }
    }
}
</script>
