<template>
  <div class="login-form">
    <div class="header">
      Authorization
    </div>
    <form @submit.prevent="login">
      <div class="form">
        <input v-model="username" type="text" placeholder="Username" required>
        <input v-model="password" type="password" placeholder="Password" required id="password">
        <div>
          <!--check login and password-->
          <game-button type="submit" class="enter">
            Login
          </game-button>
        </div>
        <div>
          <router-link to="/register">
            <a class="reg">Don't have account yet?</a>
          </router-link>
        </div>
      </div>
    </form>
    <!-- Back button -->
    <div class="back">
      <router-link to="/">
        <game-button class="back-btn">
          Back
        </game-button>
      </router-link>
    </div>
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
  justify-content: center;
  align-items: center; /* Центрируем по горизонтали */
  height: 100vh; /* Занимаем всю высоту экрана */
}

.header {
  background: transparent;
  font-size: 60px;
  text-align: center;
  padding: 20px;
  color: #7f9e9f;
  font-weight: 900;
}

.form {
  display: flex;
  flex-direction: column;
  background: transparent;
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

.back {
  margin-top: 20px;
}

.back-btn {
  color: #9dd5ca;
  font-size: 30px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  transition: text-shadow 0.3s;
}

.back-btn:hover {
  text-shadow: 0 0 25px #c3dcd5;
}
</style>
