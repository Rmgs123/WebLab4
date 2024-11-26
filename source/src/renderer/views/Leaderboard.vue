<template>
    <div class="leaderboard">
        <div class="header">
            Leaderboard
        </div>
        <div class="table">
            <div class="row-table header-row">
                <div class="name">Nickname</div>
                <div class="score">Result</div>
            </div>
            <div v-for="user in info" :key="user.username" class="row-table">
                <div class="name">{{ user.username }}</div>
                <div class="score">{{ formatTime(user.score) }}</div>
            </div>
        </div>
        <router-link to="/">
            <div class="exit">
                <game-button>Back</game-button>
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
        user-select: none;
        width: 100%;
        max-width: 600px; 
        margin: 0 auto; 
        border: none;
        border-radius: 8px; 
        overflow: hidden; 
    }

    .header {
        background: transparent;
        padding: 10px;
        text-align: center; 
        font-size: 80px;
        font-weight: 100;
        margin-bottom: 20px;
        animation: glow 2.5s infinite;
    }

    .table {
        display: flex;
        flex-direction: column; 
    }

    .row-table {
        display: flex; 
        justify-content: space-between; 
        padding: 10px; 
        border-bottom: 1px solid #666565;
        border-left: 1px solid #666565;
        border-right: 1px solid #666565;
    }

        .row-table.header-row {
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            font-size: 22px;
            color: #e0e0e0;
        }

        /* Анимация свечения и цвета */
        @keyframes glow {
            0%, 100% {
                font-weight: 400;
                color: #86b8ae; /* Цвет текста в начале и конце */
                text-shadow: 0 0 3px #86b8ae, 0 0 7px #86b8ae, 0 0 18px #86b8ae;
            }
            50% {
                font-weight: bold;
                color: #68e3cb; /* Цвет текста в середине */
                text-shadow: 0 0 15px #7ef2db, 0 0 20px #7ef2db, 0 0 2px #7ef2db;
            }
        }

    .name {
        flex: 1; 
    }

    .score {
        flex: 1; 
        text-align: right; 
    }

    .exit {
        text-align: center;
        margin-bottom: 12px;
    }
</style>