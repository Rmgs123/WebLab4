<template>
  <div class="menu">
    <div class="header">
      Menu
    </div>
    <div class="buttons">
      <router-link to="/game">
        <game-button class="btns">
          Play
        </game-button>
      </router-link>
      <router-link to="/profile">
        <game-button class="btns">
          Profile
        </game-button>
      </router-link>
      <router-link to="/leaderboard">
        <game-button class="btns">
          Leaderboard
        </game-button>
      </router-link>
      <div v-if="!isAuth">
        <router-link to="/login">
          <game-button class="btns">
            Login
          </game-button>
        </router-link>
      </div>
      <div v-if="!isAuth">
        <router-link to="/register">
          <game-button class="btns">
            Registration
          </game-button>
        </router-link>
      </div>
      <div class="exit">
        <router-link to="/login">
          <game-button class="btns" @click="handleExit">
            Logout
          </game-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue"
import GameButton from "../components/GameButton.vue"

export default defineComponent({
  components: {
    GameButton
  },
  data() {
    let isAuth: Boolean = false
    return {
      isAuth
    };
  },
  async mounted() {
    this.checkAuth()
  },

  methods: {
    async handleExit() {
      localStorage.removeItem('token');
    },
    async checkAuth() {
      if (localStorage.getItem('token'))
        this.isAuth = true
    }
  }
})
</script>

<style lang="css" scoped>
.menu {
  display: flex;
  flex-direction: column;
}

.leftSide {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
}

.about {
  height: 45vh;
}

.game-route {
  height: 55vh;
  align-self: flex-start;
}

.buttons {
  user-select: none;
  display: flex;
  flex-direction: column;

}

.exit {
  background: transparent;
  position: absolute;
  bottom: 2em;
}

.btns {
  width: 9em;
  font-size: 5cqmin;
  margin-bottom: 0.5em;
}

.header {
  user-select: none;
  font-size: 80px;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  color: #7f9e9f;
  font-weight: 900;
}
</style>