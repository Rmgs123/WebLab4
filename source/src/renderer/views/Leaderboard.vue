<template>
    <div class="leaderboard">
        <div class="header">
            Таблица лидеров
        </div>
        <div class="table">
            <div class="row-table header-row">
                <div class="name">Ник</div>
                <div class="score">Результат</div>
            </div>
            <div v-for="user in info" :key="user.username" class="row-table">
                <div class="name">{{ user.username }}</div>
                <div class="score">{{ formatTime(user.score) }}</div>
            </div>
        </div>
        <router-link to="/">
            <div class="exit">
                <game-button>Назад</game-button>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GameButton from "../components/GameButton.vue";
import User from "../typings/User";
import http from "../http_common";

export default defineComponent({
    components: {
        GameButton
    },

    data() {
        const info: User[] = [];
        return { info };
    },
    async mounted() {
        await http.get('/users/')
            .then((response) => {
                this.info = response.data;
                console.log(response);
            })
            .catch((e) => {
                console.log(e);
            });
    },
    methods: {
        formatTime(score: number): string {
            const totalMilliseconds = score; 
            const minutes = Math.floor(totalMilliseconds / 60000);
            const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
            const milliseconds = Math.floor((totalMilliseconds % 1000) / 10); 

            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`; // Формат "MM:SS:MS"
        }
    }
});
</script>

<style scoped lang="css">
    .leaderboard {
        width: 100%;
        max-width: 600px; 
        margin: 0 auto; 
        border: 1px solid #ccc; 
        border-radius: 8px; 
        overflow: hidden; 
    }

    .header {
        background-color: #f0f0f0; 
        padding: 10px; 
        text-align: center; 
        font-size: 24px; 
        font-weight: bold; 
    }

    .table {
        display: flex;
        flex-direction: column; 
    }

    .row-table {
        display: flex; 
        justify-content: space-between; 
        padding: 10px; 
        border-bottom: 1px solid #ccc; 
    }

        .row-table.header-row {
            background-color: #e0e0e0; 
            font-weight: bold; 
        }

    .name {
        flex: 1; 
    }

    .score {
        flex: 1; 
        text-align: right; 
    }

    .exit {
        margin-top: 20px; 
        text-align: center; 
    }
</style>