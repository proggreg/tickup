<template>
    <v-bottom-navigation
        grow
        app
    >
        <v-btn
            to="/"
            value="home"
        >
            <v-icon>mdi-home</v-icon>
            <span>Home</span>
        </v-btn>

        <v-btn
            to="/lists"
            value="lists"
        >
            <v-icon>mdi-format-list-bulleted</v-icon>
            <span>Lists</span>
        </v-btn>

        <v-btn
            to="/search"
            value="search"
        >
            <v-icon>mdi-magnify</v-icon>
            <span>Search</span>
        </v-btn>

        <v-btn
            to="/chat"
            value="chat"
        >
            <v-icon>mdi-creation</v-icon>
            <span>Chat</span>
        </v-btn>

        <v-btn
            to="/account"
            value="settings"
        >
            <v-icon>mdi-account-circle</v-icon>
            <span>Account</span>
        </v-btn>
    </v-bottom-navigation>
</template>
