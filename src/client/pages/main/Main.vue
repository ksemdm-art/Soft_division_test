<template>
    <v-app class="app-main">
        <v-app-bar app>
            <v-toolbar-title>Управление сотрудниками</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn text to="/">Сотрудники</v-btn>
            <v-btn text to="/employee/new">Новый сотрудник</v-btn>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'app-main'
}
</script>