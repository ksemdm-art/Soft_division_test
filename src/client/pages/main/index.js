import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify/lib";

import 'vuetify/dist/vuetify.css';

import Main from './Main';
import EmployeeList from './EmployeeList';
import EmployeeDetails from './EmployeeDetails';

Vue.use(VueRouter);
Vue.use(Vuetify, { iconfont: 'mdi' });

const routes = [
    { path: '/', component: EmployeeList },
    { path: '/employee/:id', component: EmployeeDetails },
    { path: '/employee/new', component: EmployeeDetails }
]


const router = new VueRouter({
    routes,
    mode: 'history'
})

new Vue({
    vuetify: new Vuetify(),
    router,
    render: (h) => h(Main)
}).$mount('#app');