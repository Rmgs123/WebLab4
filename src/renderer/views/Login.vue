<template>
    <div class="login-form">
        <div class="header">
            Авторизация
        </div>
        <form @submit.prevent="login">
            <div class="form">
                <input v-model="username" type="text" placeholder="Имя пользователя" required>
                <input v-model="password" type="password" placeholder="Пароль" required id="password">
                <div>
                    <!--check login and password-->
                    <game-button type="submit" class="enter">
                        Войти
                    </game-button>
                </div>
                <div>
                    <router-link to="/register">
                        <a class="reg">Еще нет аккаунта?</a>
                    </router-link>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import http from "../http_common";
import GameButton from "../components/GameButton.vue";

export default {
    components: {
        GameButton
    },

    data() {
        return {
            username: '',
            password: '',
            isShow: false,
            isAuth: false,
        };
    },

    methods: {
        async login() {
            try {
                const response = await http.post('/login/', {
                    username: this.username,
                    password: this.password,
                });

                const token = response.data.token;

                if (token) {
                    localStorage.setItem('token', token);
                    this.isAuth = true;
                    this.$router.push("/");
                }
            } catch (error) {
                console.error(error);
            }
        },
    }
};
</script>

<style scoped lang="css">
.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.header {
    background-color: #060223;
    font-size: 30px;
    text-align: center;
    padding: 20px;
    color: #7f9e9f;
    font-weight: 700;
}

.form {
    display: flex;
    flex-direction: column;
    background-color: #b8cece;
    border-radius: 5px;
    padding: 10px;
    align-items: center;
}

.form input {
    margin-bottom: 10px;
}

.form div {
    margin-bottom: 10px;
}

input {
    padding: 5px;
    background: none;
    border: 3px solid #8496ae;
    border-radius: 10px;
    font-size: 20px;
    font-family: 'Comfortaa', sans-serif;
}

input:focus {
    outline: none;
}

.pwrd {
    display: flex;
}

.pwrd-img {
    width: 4cqmin;
}

.show {
    width: 15%;
    margin-left: 1em;
    background: none;
    border: 3px solid #8496ae;
    border-radius: 10px;
    background: #8496ae;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.show:hover {
    box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24), 0 17px 50px 0 rgba(0, 0, 0, 0.19);
}

.enter {
    font-size: 24px;
    cursor: pointer;
}

.reg {
    font-style: italic;
    color: rgb(87, 83, 83);
}

.reg:hover {
    text-decoration: underline;
}

a {
    text-decoration: none;
}
</style>