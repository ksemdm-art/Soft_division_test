import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify/lib";
import 'vuetify/dist/vuetify.css';
import Vuex from 'vuex'


import Main from './Main';
import EmployeeList from './EmployeeList';
import EmployeeDetails from './EmployeeDetails';
import store from './store'

Vue.use(VueRouter);
Vue.use(Vuetify, { iconfont: 'mdi' });
Vue.use(Vuex)

const routes = [
    { path: '/', component: EmployeeList },
    { path: '/employee/view/:id', component: EmployeeDetails },
    { path: '/employee/edit/:id', component: EmployeeDetails },
    { path: '/employee/new', component: EmployeeDetails }
]


const router = new VueRouter({
    routes,
    mode: 'history'
})

new Vue({
    vuetify: new Vuetify(),
    router,
    store,
    render: (h) => h(Main)
}).$mount('#app');

