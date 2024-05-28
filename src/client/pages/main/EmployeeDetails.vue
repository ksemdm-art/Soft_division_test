<template>
    <v-container>
        <h1>{{ isNew ? 'Добавить сотрудника' : 'Информация о сотруднике' }}</h1>
        <v-form @submit.prevent="saveEmployee">
            <v-text-field v-model="employee.surname" :readonly="isView" label="Фамилия" required></v-text-field>
            <v-text-field v-model="employee.name" :readonly="isView" label="Имя" required></v-text-field>
            <v-text-field v-model="employee.patronymic" :readonly="isView" label="Отчество" required></v-text-field>
            <v-text-field v-model="employee.email" :readonly="isView" label="Email" required></v-text-field>
            <h2>Friends</h2>
            <v-data-table :headers="friendHeaders" :items="friends">
                <template v-slot:item.actions="{ item }">
                    <v-btn color="error" :disabled="isView" @click="removeEmployeeFriend(item.id)">Удалить</v-btn>
                </template>
            </v-data-table>
            <v-autocomplete v-model="selectedFriend" :items="availableFriends" :readonly="isView" label="Добавить друга"
                item-text="fullName" item-value="id"></v-autocomplete>
            <v-btn color="primary" :disabled="isView" type="submit">Сохранить</v-btn>
            <v-btn color="error" :disabled="isView" @click="deleteEmployee">Удалить</v-btn>
            <v-btn color="info" @click="showCycles">Показать циклические связи</v-btn>
        </v-form>
        <cycles-modal ref="cyclesModal" :employee="employee" :cycles="cycles"></cycles-modal>
    </v-container>
</template>

<script>
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'
import CyclesModal from './CyclesModal.vue'

export default {
    components: {
        CyclesModal
    },
    data() {
        return {
            selectedFriend: null,
            cycles: [],
            isReadonly: false,
            cyclesModalRef: null,
            friendHeaders: [
                { text: 'Полное имя', value: 'fullName' },
                { text: 'Действия', value: 'actions', sortable: false }
            ],
        }
    },
    computed: {
        ...mapState(['employees', 'availableFriends']),
        ...mapGetters(['getEmployeeById', 'getAvailableFriends']),
        isNew() {
            return this.$route.path === '/employee/new'

        },
        isView() {
            return this.$route.path === `/employee/view/${this.$route.params.id}`
        },
        employee: {
            get() {
                if (this.isNew) {
                    return {
                        id: Math.max(...this.employees.map(f => f.id)) + 1,
                        surname: '',
                        name: '',
                        patronymic: '',
                        email: '',
                        friends: []
                    }
                } else {
                    return this.getEmployeeById(this.$route.params.id)
                }
            },
            set(value) {
                this.updateEmployee(value)
            }
        },
        friends() {
            const employee = this.getEmployeeById(this.$route.params.id)
            return employee ? employee.friends.map(id => this.availableFriends.find(f => f.id === id)) : []
        },
        availableFriends() {
            return this.getAvailableFriends(this.$route.params.id)
        }
    },

    methods: {
        ...mapActions(['addEmployee', 'updateEmployee', 'deleteEmployee', 'addFriend', 'removeFriend']),
        saveEmployee() {
            if (this.isNew) {
                const newEmployee = {
                    id: Math.max(...this.availableFriends.map(f => f.id)) + 1,
                    surname: this.employee.surname,
                    name: this.employee.name,
                    patronymic: this.employee.patronymic,
                    email: this.employee.email,
                    friends: []
                }
                if (this.selectedFriend) {
                    newEmployee.friends.push(this.selectedFriend)
                }
                this.addEmployee(newEmployee)
            } else {
                this.updateEmployee(this.employee)
                if (this.selectedFriend) {
                    this.addFriend({ employeeId: this.$route.params.id, friendId: this.selectedFriend })
                    this.selectedFriend = null
                }

            }
            this.$router.push('/')
        },
        removeEmployeeFriend(friendId) {
            this.removeFriend({ employeeId: this.$route.params.id, friendId })
        },
        deleteEmployee() {
            this.deleteEmployee(this.$route.params.id)
            this.$router.push('/')
        },
        showCycles() {
            this.findCyclicRelationships(this.employee, this.employees)
            this.cyclesModalRef.open()
        },

        findCyclicRelationships(employee, employees) {
            const employeeMap = new Map();
            const visited = new Set();
            const stack = [];
            const path = [];
            const cycles = [];

            for (const emp of employees) {
                employeeMap.set(emp.id, emp);
            }

            this.findCyclesForEmployee(employee, employeeMap, visited, stack, path, cycles);

            this.cycles = cycles;
            for (const cycle of this.cycles) {
                cycle.push(this.employee)
                console.log(`Циклическая связь: ${cycle.map((e) => e.name).join(' -> ')}`);
            }
        },

        findCyclesForEmployee(employee, employeeMap, visited, stack, path, cycles) {
            visited.add(employee.id);
            stack.push(employee);
            path.push(employee);

            for (const friendId of employee.friends) {
                const friend = employeeMap.get(friendId);
                if (friend) {
                    if (visited.has(friend.id)) {
                        const cycleIndex = path.findIndex((e) => e.id === friend.id);
                        cycles.push(path.slice(cycleIndex));
                    } else {
                        this.findCyclesForEmployee(friend, employeeMap, visited, stack, path, cycles);
                    }
                }
            }

            stack.pop();
            path.pop();
        }
    },

    mounted() {
        this.cyclesModalRef = this.$refs.cyclesModal;
    },
}
</script>