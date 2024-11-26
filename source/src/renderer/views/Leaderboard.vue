<template>
    <div class="leaderboard">
        <div class="header">
            Таблица лидеров
        </div>
        <div class="row-table">
            <div class="name" style="font-size: 26px; font-weight: 700;">
                Ник
            </div>
            <div class="score" style="font-size: 26px; font-weight: 700;">
                Результат
            </div>
        </div>
        <div v-for="user in info" :key="username">
            <div class="row-table">
                <div class="name">
                    {{user.username}}
                </div>
                <div class="score">
                    {{user.score}}
                </div>
            </div>
        </div>
        <router-link to="/">
            <div class="exit">
                <game-button>
                    Назад
                </game-button>
            </div>
        </router-link>
    </div>
</template>
<script lang="ts">
    import { Component, defineComponent } from "vue";
    import GameButton from "../components/GameButton.vue";
    import User from "../typings/User"
    import http from "../http_common";
    export default defineComponent({
        components: {
            GameButton
        },

        data() {
            const info: User[] = []
            return { info };
        },
        async mounted() {
                await http.get('/users/')
                .then((response) => {
                    this.info = response.data;
                    console.log(response)
                })
                .catch((e) => {
                    console.log(e)
                })
        }
    })
</script>

<style scoped lang="css">
    .leaderboard {
        display: flex;
        flex-direction: column;
        width: 40%;
        background-color: #b8cece;
        color: #2f1e1e;
        font-size: 22px;
    }
    .exit {
        display: flex;
        position: absolute;
        justify-content: flex-end;
        width: 40%;
        bottom: 2em;
        right: 2em;
    }

    .row-table {
        display: flex;
        border-bottom: 5px solid #060223;
    }

    .name {
        display: flex;
        justify-content: center;
        width: 50%;
        border-right: 5px solid #060223;
        padding: 5px;
    }

    .score {
        display: flex;
        justify-content: center;
        width: 50%;
        padding: 5px;
    }

    .header {
        background-color: #060223;
        font-size: 30px;
        text-align: center;
        padding: 20px;
        color: #7f9e9f;
        font-weight: 700;
    }
</style>