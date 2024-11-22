<template>
  <div class="bg">
    <div class="game">
      <div class="score-info">Ваш счёт: {{ score }}</div>

      <!-- Игровое поле -->
      <div class="game-field">
        <!-- Игрок -->
        <div class="player" :style="{ top: playerY + 'px', left: playerX + 'px' }"></div>

        <!-- Лазеры -->
        <div
          v-for="(laser, index) in lasers"
          :key="index"
          class="laser"
          :style="{ top: laser.y + 'px', left: laser.x + 'px' }"
        ></div>
      </div>
    </div>

    <div v-if="!isPlaying" class="game-over">
      <div>Ваш результат: {{ score }}</div>
      <router-link to="/" style="width: 300px; display: flex; justify-content: center; align-items: center;">
        <game-button>Назад</game-button>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      isPlaying: true, // Статус игры
      score: 0, // Текущий счёт
      playerX: 200, // Координаты игрока
      playerY: 200,
      lasers: [], // Массив лазеров
      keysPressed: {}, // Состояние нажатия клавиш

      // Конфигурация игры
      playerSpeed: 6, // Скорость игрока
      laserSpeed: 6, // Скорость пуль
      maxLasers: 300, // Максимальное количество пуль
    };
  },
  methods: {
    // Обработка нажатия клавиш
    handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "ц", "ф", "ы", "в"].includes(key)) {
        this.keysPressed[key] = true;
      }
    },

    // Обработка отпускания клавиш
    handleKeyUp(event) {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "ц", "ф", "ы", "в"].includes(key)) {
        this.keysPressed[key] = false;
      }
    },

    // Движение игрока
    movePlayer() {
      let dx = 0;
      let dy = 0;

      // WASD или ЦФЫВ
      if (this.keysPressed["w"] || this.keysPressed["ц"]) dy -= 1;
      if (this.keysPressed["s"] || this.keysPressed["ы"]) dy += 1;
      if (this.keysPressed["a"] || this.keysPressed["ф"]) dx -= 1;
      if (this.keysPressed["d"] || this.keysPressed["в"]) dx += 1;

      // Нормализация вектора
      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * this.playerSpeed;
        dy = (dy / length) * this.playerSpeed;

        this.playerX = Math.max(0, Math.min(380, this.playerX + dx));
        this.playerY = Math.max(0, Math.min(380, this.playerY + dy));
      }
    },

    // Создание нового лазера
    spawnLaser() {
      if (this.lasers.length >= this.maxLasers) return;

      const side = Math.random() > 0.5 ? "horizontal" : "vertical";
      const position = Math.random() * 400;

      if (side === "horizontal") {
        this.lasers.push({
          x: Math.random() > 0.5 ? 0 : 400,
          y: position,
          dx: Math.random() > 0.5 ? this.laserSpeed : -this.laserSpeed,
          dy: 0,
        });
      } else {
        this.lasers.push({
          x: position,
          y: Math.random() > 0.5 ? 0 : 400,
          dx: 0,
          dy: Math.random() > 0.5 ? this.laserSpeed : -this.laserSpeed,
        });
      }
    },

    // Обновление пуль
    updateLasers() {
      this.lasers = this.lasers.map((laser) => ({
        ...laser,
        x: laser.x + laser.dx,
        y: laser.y + laser.dy,
      })).filter((laser) => laser.x >= 0 && laser.x <= 400 && laser.y >= 0 && laser.y <= 400);

      // Проверка столкновений
      this.lasers.forEach((laser) => {
        if (
          Math.abs(laser.x - this.playerX) < 20 &&
          Math.abs(laser.y - this.playerY) < 20
        ) {
          this.endGame();
        }
      });
    },

    // Окончание игры
    endGame() {
      this.isPlaying = false;
    },
  },
  mounted() {
    // Добавление обработчиков клавиатуры
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Основной игровой цикл
    const gameLoop = () => {
      if (this.isPlaying) {
        this.movePlayer(); // Движение игрока
        this.updateLasers(); // Обновление пуль
        if (Math.random() < 0.05) this.spawnLaser(); // Случайное появление пуль
        this.score++; // Увеличение счёта
        setTimeout(gameLoop, 16); // Плавность 60 FPS
      }
    };
    gameLoop();
  },
  beforeUnmount() {
    // Удаление обработчиков клавиатуры
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  },
});
</script>

<style scoped>
.bg {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  color: white;
}

.game-field {
  width: 400px;
  height: 400px;
  border: 2px solid white;
  position: relative;
  background-color: #222;
}

.player {
  width: 20px;
  height: 20px;
  background-color: red;
  position: absolute;
  border-radius: 50%;
}

.laser {
  width: 20px;
  height: 20px;
  background-color: yellow;
  position: absolute;
}

.game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  color: white;
}
</style>
