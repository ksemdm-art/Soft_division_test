import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        employees: [
            { id: 1, surname: 'Doe', name: 'John', patronymic: 'Doe', email: 'john.doe@example.com', friends: [2, 3] },
            { id: 2, surname: 'Smith', name: 'Jane', patronymic: 'Smith', email: 'jane.smith@example.com', friends: [1] },
            { id: 3, surname: 'Johnson', name: 'Bob', patronymic: 'Johnson', email: 'bob.johnson@example.com', friends: [1] }
        ],
        availableFriends: [
            { id: 1, surname: 'Doe', name: 'John', patronymic: 'Doe', fullName: 'John Doe Doe' },
            { id: 2, surname: 'Smith', name: 'Jane', patronymic: 'Smith', fullName: 'Jane Smith Smith' },
            { id: 3, surname: 'Johnson', name: 'Bob', patronymic: 'Johnson', fullName: 'Bob Johnson Johnson' }
        ],
        currentEmployee: {},
    },
    mutations: {
        addEmployee(state, employee) {
            state.employees.push(employee)
            const fullName = `${employee.name} ${employee.surname} ${employee.patronymic}`
            const newEmployee = {
                id: employee.id,
                name: employee.name,
                surname: employee.surname,
                patronymic: employee.patronymic,
                fullName: fullName
            }
            state.availableFriends.push(newEmployee)
        },
        updateEmployee(state, employee) {
            const index = state.employees.findIndex(e => e.id === employee.id)
            if (index !== -1) {
                state.employees.splice(index, 1, employee)
            }
        },
        deleteEmployee(state, employeeId) {
            // state.employees = state.employees.filter(e => e.id !== employeeId)
            const index = state.employees.findIndex(emp => emp.id === employeeId)
            if (index !== -1) {
                state.employees.splice(index, 1)
            }
        },
        addFriend(state, { employeeId, friendId }) {
            const employee = state.employees[employeeId - 1]
            if (employee) {
                employee.friends.push(friendId)
            }
        },
        removeFriend(state, { employeeId, friendId }) {
            const employee = state.employees[employeeId - 1]
            if (employee) {
                employee.friends = employee.friends.filter(f => f !== friendId)
            }
        },
    },
    actions: {
        addEmployee({ commit }, employee) {
            commit('addEmployee', employee)
        },
        updateEmployee({ commit }, employee) {
            commit('updateEmployee', employee)
        },
        deleteEmployee({ commit }, employeeId) {
            commit('deleteEmployee', employeeId)
        },
        addFriend({ commit }, { employeeId, friendId }) {
            commit('addFriend', { employeeId, friendId })
        },
        removeFriend({ commit }, { employeeId, friendId }) {
            commit('removeFriend', { employeeId, friendId })
        },
    },
    getters: {
        getEmployeeById: state => id => {
            return state.employees[id - 1]
        },
        getAvailableFriends: state => employeeId => {
            const employee = state.employees.find(e => e.id === employeeId)
            return state.availableFriends.filter(f => !employee || !employee.friends.includes(f.id))
        }
    }
})


