<template>
    <div class="container">
        <div class="profile">
            <div class="header">
                Profile
            </div>
            <div class="main-info">
                <div class="profile-photo">
                    <img src="../assets/profile-avatar.png" class="avatar-photo">
                    <div class="profile-info">
                        <div>
                            <div>
                                Nickname:
                            </div>
                            <div class="field" v-if="user">
                                <div id="name">
                                    {{ user.username }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="scores" v-if="user">
                    <div>
                        Your last result:
                    </div>
                    <div>
                        {{ formatTime(user.score) }}
                    </div>
                </div>
            </div>
            <router-link to="/">
                <div class="exit">
                    <game-button>
                        <span>Back</span>
                    </game-button>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GameButton from "../components/GameButton.vue";
import http from "../http_common";
import User from "../typings/User";

export default defineComponent({
    components: {
        GameButton
    },
    data() {
        return {
            user: null as User | null
        };
    },
    async mounted() {
        const token = localStorage.getItem('token');
        await http.get('/profile/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then((response) => {
            console.log("API Response:", response.data);
            this.user = response.data;
        })
        .catch((e) => {
            console.log("Ошибка при получении данных:", e);
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

<style lang="css" scoped>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100%;
        margin: 0;
    }
    .profile {
        user-select: none;
        display: flex;
        flex-direction: column;
        width: 35%;
        color: #2f1e1e;
        font-size: 20px;
    }

    .avatar-photo {
        width: 35%;
        margin-left: 0.5em;
    }

    .profile-photo {
        display: flex;
        flex-direction: row;
    }

    .field {
        display: flex;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        width: 65%;
        padding-left: 1em;
    }

    .scores {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 0.5em;
    }

    .header {
        background: transparent;
        font-size: 60px;
        text-align: center;
        padding: 20px;
        color: #7f9e9f;
        font-weight: 700;
        animation: glow 4s infinite;
    }

    .exit {
        width: auto;
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .main-info {
        border-radius: 10px;
        background-color: #b8cece;
        padding: 15px;
        margin-left: auto;
        margin-right: auto;
        width: 300px;
        height: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    span {
        font-size: 40px;
    }
    a {
        text-decoration: none;
    }
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
</style>