<template>
    <div class="profile">
        <div class="header">
            Профиль
        </div>
        <div class="main-info">
            <div class="profile-photo">
                <img src="../assets/profile-avatar.png" class="avatar-photo">
                <div class="profile-info">
                    <div>
                        <div>
                            Ник
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
                    Ваш последний результат
                </div>
                <div>
                    {{ formatTime(user.score) }}
                </div>
            </div>
        </div>
        <router-link to="/">
            <div class="exit">
                <game-button>
                    Вернуться назад
                </game-button>
            </div>
        </router-link>
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
    .profile {
        display: flex;
        flex-direction: column;
        width: 35%;
        color: #2f1e1e;
        font-size: 22px;
    }

    .exit {
        display: flex;
        position: absolute;
        justify-content: center;
        width: 35%;
        bottom: 2em;
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
        background-color: #060223;
        font-size: 30px;
        text-align: center;
        padding: 20px;
        color: #7f9e9f;
        font-weight: 700;
    }

    .main-info {
        border-radius: 10px;
        background-color: #b8cece;
        padding: 10px;
    }
</style>