<template>
  <div class="menu">
     <div class="laser-background"></div>
    <div class="header">
      Laser Run
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
  <div class="hotkeys">
    "CTRL +" or "CTRL -" for resizing<br>
    F11 -  fullscreen
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
@keyframes flicker {
    0%, 100% {
        opacity: 0.14;
    }
    50% {
        opacity: 0.4;
    }
}

.laser-background {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent, #7f9e9f, transparent),
                linear-gradient(to bottom, transparent, #7f9e9f, transparent);
    animation: flicker 4.2s infinite alternate;
    z-index: -1;
}
.menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    margin: 0;
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
  margin-top: 1em;
  position: static;
  width: 100%;
  display: flex;
  justify-content: center;
}

.btns {
  width: 9em;
  font-size: 29px;
  margin-bottom: 10px;
}

.header {
  user-select: none;
  font-size: 100px;
  text-align: center;
  padding: 20px;
  color: #7f9e9f;
  font-weight: 900;
  animation: glow 4.2s infinite;
}

.hotkeys {

  position: absolute;
  bottom: 10px;
  right: 10px;
  color: #ffffff;
  font-size: 14px;
  opacity: 0.5;
  user-select: none;
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
            text-shadow: 0 0 25px #7ef2db, 0 0 25px #7ef2db, 0 0 2px #7ef2db;
        }
    }
</style>