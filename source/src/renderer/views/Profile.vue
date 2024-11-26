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
                    Ваш лучший результат
                </div>
                <div>
                    {{user.score}}
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
import { defineComponent, PropType } from "vue"
import GameButton from "../components/GameButton.vue";
import axios from "axios";
import http from "../http_common";
import User from "../typings/User";
export default defineComponent({
    components: {
        GameButton
    },
    data() {
        const info: User[] = []
        return { info };
    },
    async mounted() {
            await http.get('/user/')
            .then((response) => {
                this.user = response.data;
                console.log(response)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    })
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

.copy-img {
    width: 100%;
}

#copy-id {
    width: 15%;
    margin-left: 1em;
    background: none;
    border: 3px solid #8496ae;
    border-radius: 10px;
    background: #8496ae;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
}

#copy-id:hover {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}

#copy-name {
    width: 15%;
    margin-left: 1em;
    background: none;
    border: 3px solid #8496ae;
    border-radius: 10px;
    background: #8496ae;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
}

#copy-name:hover {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}

#id {
    width: 70%;
    background-color: #657d7d;
    color: #dee7e3;
    padding: 0.5em;
    border-radius: 5px;
    font-size: 18px;
}

#name {
    width: 70%;
    background-color: #657d7d;
    color: #dee7e3;
    padding: 0.5em;
    border-radius: 5px;
    font-size: 18px;
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