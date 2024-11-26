<template>
  <div class="register">
    <div class="header">
      Registration
    </div>
    <form @submit.prevent="register">
      <div class="form">
        <input v-model="username" type="text" placeholder="Username" required>
        <input v-model="email" type="text" placeholder="Email" required>
        <input v-model="password" type="password" placeholder="Password" required id="password">
        <div class="in">
          <!--check register and password-->
          <game-button type="submit" class="enter">
            Login
          </game-button>
        </div>
        <div class="in">
          <router-link to="/">
            <game-button class="enter">
              Back
            </game-button>
          </router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import http from "../http_common";
import GameButton from "../components/GameButton.vue";
import router from "../router";

export default {
  components: {
    GameButton
  },

  data() {
    return {
      username: '',
      email: '',
      password: '',
    };
  },

  methods: {
    async register() {
      try {
        const response = await http.post('/register/', {
          username: this.username,
          email: this.email,
          password: this.password,
        });

        const token = response.data.token;

        if (token) {
          this.$router.push("/");
          localStorage.setItem('token', token);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped lang="css">
.register {
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* Центрируем по горизонтали */
  height: 100vh;
}

.header {
  background: transparent;
  font-size: 60px;
  text-align: center;
  padding: 20px;
  color: #7f9e9f;
  font-weight: 900;
  animation: glow 4s infinite;
}

.form {
  display: flex;
  flex-direction: column;
  background: transparent;
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
  color: white;
  padding: 5px;
  background: none;
  border: 1px solid #637081;
  border-radius: 10px;
  font-size: 20px;
  font-family: 'Comfortaa', sans-serif;
  transition: box-shadow 0.17s ease-in-out;
}

input:focus {
  outline: none;
  box-shadow: 0 0 8px #94d1d1;
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
  font-size: 30px;
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