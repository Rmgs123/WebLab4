<template>
  <div class="bg">
    <div class="game">
      <div class="score-info">Your score: {{ score }}</div>

      <!-- Игровое поле -->
      <div class="game-field">
        <!-- Игрок -->
        <div
          class="player"
          :class="{ dashing: isDashing }"
          :style="{
            top: playerY + 'px',
            left: playerX + 'px',
          }"
        ></div>

        <!-- Лазеры -->
        <div
          v-for="(laser, index) in lasers"
          :key="laser.id"
          class="laser"
          :class="[{ active: laser.isActive }, laser.color]"
          :style="{
            top: laser.y + 'px',
            left: laser.x + 'px',
            width: laser.width + 'px',
            height: laser.height + 'px',
            transform: 'rotate(' + laser.angle + 'deg)',
            'transform-origin': 'top left',
          }"
        ></div>
      </div>
    </div>

    <div v-if="!isPlaying" class="game-over">
      <div>Your result: {{ score }}</div>
      <router-link
        to="/"
        style="display: flex; justify-content: center; align-items: center;"
      >
        <button class="btn">Back</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Game',
  data() {
    return {
      isPlaying: true,
      score: 0,
      playerX: 190,
      playerY: 190,
      playerSpeed: 3.5,
      playerRadius: 8,
      collisionRadius: 5, // Радиус для проверки коллизии - меньше персонажа для приятной игры
      keysPressed: {},
      lasers: [],
      laserIdCounter: 0,
      lastDashTime: 0, // Для отслеживания времени последнего рывка
      dashCooldown: 1000, // Кулдаун рывка в миллисекундах
      dashDistance: 50, // Расстояние рывка
      isDashing: false, // Флаг для отображения эффекта рывка
    };
  },
  methods: {
    handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', 'shift'].includes(key)) {
        this.keysPressed[key] = true;
      }
    },
    handleKeyUp(event) {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', 'shift'].includes(key)) {
        this.keysPressed[key] = false;
      }
    },
    movePlayer() {
      let dx = 0;
      let dy = 0;

      if (this.keysPressed['w'] || this.keysPressed['ц']) dy -= this.playerSpeed;
      if (this.keysPressed['s'] || this.keysPressed['ы']) dy += this.playerSpeed;
      if (this.keysPressed['a'] || this.keysPressed['ф']) dx -= this.playerSpeed;
      if (this.keysPressed['d'] || this.keysPressed['в']) dx += this.playerSpeed;

      // Нормализуем движение, чтобы скорость оставалась постоянной по диагонали
      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }

      // Рывок
      const now = Date.now();
      if (
        this.keysPressed['shift'] &&
        (dx !== 0 || dy !== 0) &&
        now - this.lastDashTime > this.dashCooldown
      ) {
        // Нормализуем направление для рывка
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const dashX = (dx / magnitude) * this.dashDistance;
        const dashY = (dy / magnitude) * this.dashDistance;

        this.playerX += dashX;
        this.playerY += dashY;

        // Ограничиваем игрока границами поля
        this.playerX = Math.max(0, Math.min(384, this.playerX));
        this.playerY = Math.max(0, Math.min(384, this.playerY));

        this.lastDashTime = now;

        // Активируем эффект рывка
        this.isDashing = true;
        setTimeout(() => {
          this.isDashing = false;
        }, 1000); // Длительность эффекта рывка
      } else {
        // Обычное движение
        this.playerX += dx;
        this.playerY += dy;

        // Ограничиваем игрока границами поля
        this.playerX = Math.max(0, Math.min(384, this.playerX));
        this.playerY = Math.max(0, Math.min(384, this.playerY));
      }
    },
    spawnLaser() {
      const id = this.laserIdCounter++;

      // Случайный выбор типа лазера
      const laserTypeRandom = Math.random();
      let laserType;

      if (laserTypeRandom < 0.33) {
        laserType = 'red';
      } else if (laserTypeRandom < 0.66) {
        laserType = 'yellow';
      } else {
        laserType = 'blue';
      }

      // Случайный выбор двух разных сторон для лазера
      const edge1 = Math.floor(Math.random() * 4);
      let edge2 = Math.floor(Math.random() * 4);
      while (edge2 === edge1) {
        edge2 = Math.floor(Math.random() * 4);
      }

      // Получаем случайные точки на границах
      const point1 = this.getRandomPointOnEdge(edge1);
      const point2 = this.getRandomPointOnEdge(edge2);

      // Вычисляем угол между точками
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Вычисляем длину лазера
      let laserLength = Math.sqrt(dx * dx + dy * dy);

      // Устанавливаем минимальную длину лазера
      const minLaserLength = 100;
      if (laserLength < minLaserLength) {
        // Увеличиваем длину лазера до минимальной, сохраняя направление
        const scale = minLaserLength / laserLength;
        laserLength = minLaserLength;
        point2.x = point1.x + dx * scale;
        point2.y = point1.y + dy * scale;
      }

      const laser = {
        id: id,
        x: point1.x,
        y: point1.y,
        width: laserLength,
        height: 5,
        angle: angle,
        isActive: false,
        color: laserType,
      };

      // Сохраняем начальные точки для синих лазеров
      if (laserType === 'blue') {
        laser.x0 = point1.x;
        laser.y0 = point1.y;
      }

      if (laserType === 'blue') {
        // Настройки для синих лазеров
        laser.rotationDirection = Math.random() < 0.5 ? -1 : 1; // -1 для влево, 1 для вправо
        laser.initialAngle = angle;
        laser.rotationAmount = laser.rotationDirection * 45; // Поворот на 45 градусов
        laser.finalAngle = laser.initialAngle + laser.rotationAmount;
        laser.rotationStartTime = Date.now();
        laser.rotationDuration = 3000; // Общее время вращения (1 секунда подготовки + 2 секунды огня)
      }

      this.lasers.push(laser);

      // Настройка времени активации и длительности выстрела
      const activationDelay = 1000; // 1 секунда
      let activeDuration;
      if (laserType === 'red') {
        activeDuration = 200; // Красный лазер активен 0.2 сек
      } else if (laserType === 'yellow') {
        activeDuration = 3000; // Жёлтый лазер активен 3 сек
      } else if (laserType === 'blue') {
        activeDuration = 2000; // Синий лазер активен 2 сек
      }

      // Активация лазера после задержки
      setTimeout(() => {
        laser.isActive = true;

        // Обработка коллизии во время активного состояния
        const collisionInterval = setInterval(() => {
          if (
            this.circleIntersectsRotatedRect(
              { x: this.playerX + this.collisionRadius, y: this.playerY + this.collisionRadius, r: this.collisionRadius },
              laser
            )
          ) {
            this.endGame();
          }
        }, 16); // Проверяем коллизию каждые 16мс (~60fps)

        // Деактивация лазера после выстрела
        setTimeout(() => {
          laser.isActive = false;

          clearInterval(collisionInterval);

          // Удаление лазера
          setTimeout(() => {
            this.lasers = this.lasers.filter((l) => l.id !== id);
          }, 200);
        }, activeDuration);
      }, activationDelay);
    },
    getRandomPointOnEdge(edge) {
      const fieldWidth = 400;
      const fieldHeight = 400;
      let x, y;

      switch (edge) {
        case 0: // Верх
          x = Math.random() * fieldWidth;
          y = 0;
          break;
        case 1: // Право
          x = fieldWidth;
          y = Math.random() * fieldHeight;
          break;
        case 2: // Низ
          x = Math.random() * fieldWidth;
          y = fieldHeight;
          break;
        case 3: // Лево
          x = 0;
          y = Math.random() * fieldHeight;
          break;
      }

      return { x, y };
    },
    circleIntersectsRotatedRect(circle, rect) {
      const rectWidth = rect.width;
      const rectHeight = rect.height;
      const rectAngle = rect.angle;

      // Центр прямоугольника
      const rectCenterX = rect.x;
      const rectCenterY = rect.y;

      // Переводим угол в радианы
      const theta = (Math.PI / 180) * -rectAngle;

      // Вычисляем синус и косинус угла
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      // Переносим круг в систему координат прямоугольника
      const dx = circle.x - rectCenterX;
      const dy = circle.y - rectCenterY;

      // Поворачиваем координаты в обратную сторону
      const rotatedX = dx * cosTheta - dy * sinTheta;
      const rotatedY = dx * sinTheta + dy * cosTheta;

      // Находим ближайшую точку на прямоугольнике к центру круга
      const closestX = Math.max(0, Math.min(rectWidth, rotatedX));
      const closestY = Math.max(0, Math.min(rectHeight, rotatedY));

      // Вычисляем расстояние от этой точки до центра круга
      const distanceX = rotatedX - closestX;
      const distanceY = rotatedY - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      // Используем радиус коллизии вместо визуального радиуса
      return distanceSquared < this.collisionRadius * this.collisionRadius;
    },
    endGame() {
      if (this.isPlaying) {
        this.isPlaying = false;
        alert('Game over!');
      }
    },
    updateLasers() {
      const now = Date.now();
      const fieldWidth = 400;
      const fieldHeight = 400;
      this.lasers.forEach((laser) => {
        if (laser.color === 'blue') {
          // Лазер синий, обновляем угол на протяжении всей жизни
          const elapsed = now - laser.rotationStartTime;
          const rotationDuration = laser.rotationDuration; // Общее время вращения (3 секунды)
          if (elapsed < rotationDuration) {
            // Интерполируем угол
            const t = elapsed / rotationDuration;
            laser.angle = laser.initialAngle + laser.rotationAmount * t;
          } else {
            // Вращение завершено
            laser.angle = laser.finalAngle;
          }

          // Теперь обновляем позицию и длину лазера
          const points = this.getLineRectangleIntersections(
            laser.x0,
            laser.y0,
            laser.angle,
            fieldWidth,
            fieldHeight
          );

          if (points.length >= 2) {
            const [p1, p2] = points;
            laser.x = p1.x;
            laser.y = p1.y;
            laser.width = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
            laser.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
          }
        }
      });
    },
    getLineRectangleIntersections(x0, y0, angle, fieldWidth, fieldHeight) {
      const rad = (Math.PI / 180) * angle;
      const cosTheta = Math.cos(rad);
      const sinTheta = Math.sin(rad);
      const points = [];

      // Левая граница x=0
      if (cosTheta !== 0) {
        let t = (0 - x0) / cosTheta;
        let y = y0 + t * sinTheta;
        if (y >= 0 && y <= fieldHeight) {
          points.push({ x: 0, y: y });
        }
      }

      // Правая граница x=fieldWidth
      if (cosTheta !== 0) {
        let t = (fieldWidth - x0) / cosTheta;
        let y = y0 + t * sinTheta;
        if (y >= 0 && y <= fieldHeight) {
          points.push({ x: fieldWidth, y: y });
        }
      }

      // Верхняя граница y=0
      if (sinTheta !== 0) {
        let t = (0 - y0) / sinTheta;
        let x = x0 + t * cosTheta;
        if (x >= 0 && x <= fieldWidth) {
          points.push({ x: x, y: 0 });
        }
      }

      // Нижняя граница y=fieldHeight
      if (sinTheta !== 0) {
        let t = (fieldHeight - y0) / sinTheta;
        let x = x0 + t * cosTheta;
        if (x >= 0 && x <= fieldWidth) {
          points.push({ x: x, y: fieldHeight });
        }
      }

      // Если нашли более двух точек, выбираем две наиболее удаленные
      if (points.length > 2) {
        let maxDist = 0;
        let maxPair = [points[0], points[1]];
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dist = dx * dx + dy * dy;
            if (dist > maxDist) {
              maxDist = dist;
              maxPair = [points[i], points[j]];
            }
          }
        }
        return maxPair;
      } else {
        return points;
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const gameLoop = () => {
      if (this.isPlaying) {
        this.movePlayer();
        this.updateLasers();
        this.score++;

        requestAnimationFrame(gameLoop);
      }
    };
    gameLoop();

    // Спавн лазеров
    setInterval(this.spawnLaser, 300);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500&family=Roboto:wght@700&display=swap');

.bg {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-field {
  width: 400px;
  height: 400px;
  border: 3px solid rgba(195, 220, 213, 0.44);
  position: relative;
  background-color: #222;
  overflow: hidden;
}

.score-info {
  margin-bottom: 20px;
  font-size: 30px;
}

.player {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  top: 190px;
  left: 190px;
}

.player.dashing {
  animation: dashAura 1s forwards;
}

@keyframes dashAura {
  0% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 0px rgba(255, 255, 255, 0);
  }
}

.laser {
  position: absolute;
  transform-origin: top left;
  transition: background-color 0.2s, box-shadow 0.2s;
  border-radius: 2.5px; /* Закругленные концы лазера */
}

.laser.red {
  background-color: rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); /* Тусклое красное свечение */
}

.laser.red.active {
  background-color: rgba(255, 0, 0, 1);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); /* Яркое красное свечение */
}

.laser.yellow {
  background-color: rgba(255, 255, 0, 0.2);
  box-shadow: 0 0 5px rgba(255, 255, 0, 0.3); /* Тусклое жёлтое свечение */
}

.laser.yellow.active {
  background-color: rgba(255, 255, 0, 1);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.8); /* Яркое жёлтое свечение */
}

.laser.blue {
  background-color: rgba(0, 0, 255, 0.2);
  box-shadow: 0 0 5px rgba(0, 0, 255, 0.3); /* Тусклое синее свечение */
}

.laser.blue.active {
  background-color: rgba(0, 0, 255, 1);
  box-shadow: 0 0 15px rgba(0, 0, 255, 0.8); /* Яркое синее свечение */
}

.game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  margin-left: 120px;
  color: white;
}

.game-over a {
  text-decoration: none;
}

.btn {
  background: none;
  color: #afc8c4;
  margin-top: 10px;
  border: none;
  background: transparent;
  font-family: 'Orbitron', sans-serif;
  font-size: 30px;
  font-weight: 700;
  transition: text-shadow 0.17s ease;
}

.btn:hover {
  text-shadow: 0 0 25px #c3dcd5;
}

.btn:focus {
  outline: none;
}
</style>
