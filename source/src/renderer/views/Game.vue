<template>
  <div class="bg">
    <div class="game">
      <div class="time-info">
        Time: {{ formattedTime }}
      </div>

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
        >
          <!-- Индикатор рывка -->
          <div
            class="dash-indicator"
            :style="{
              width: dashDistance * 2 + 'px',
              height: dashDistance * 2 + 'px',
              opacity: dashIndicatorOpacity,
            }"
          ></div>
        </div>

        <!-- Лазеры -->
        <template v-for="(laser, index) in lasers" :key="laser.id">
          <!-- Для фиолетового лазера с отражениями -->
          <div
            v-if="laser.color === 'purple' && laser.isReflecting"
            v-for="(segment, idx) in laser.path"
            :key="idx"
            class="laser"
            :class="[{ active: laser.isActive }, laser.color]"
            :style="{
              top: segment.y + 'px',
              left: segment.x + 'px',
              width: segment.length + 'px',
              height: laser.height + 'px',
              transform: 'rotate(' + segment.angle + 'deg)',
              'transform-origin': 'top left',
            }"
          ></div>
          <!-- Для фиолетового лазера в фазе подготовки -->
          <div
            v-else-if="laser.color === 'purple'"
            class="laser"
            :class="[{ active: laser.isActive }, laser.color, 'preparing' ]"
            :style="{
              top: laser.y + 'px',
              left: laser.x + 'px',
              width: laser.width + 'px',
              height: laser.height + 'px',
              transform: 'rotate(' + laser.angle + 'deg)',
              'transform-origin': 'top left',
            }"
          ></div>
          <!-- Для других типов лазеров -->
          <div
            v-else
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
        </template>
      </div>
    </div>

    <div v-if="!isPlaying" class="game-over">
      <div>Your result: {{ formattedTime }}</div>
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
import axios from 'axios';
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
      playerRadius: 6,
      collisionRadius: 4, // Радиус для проверки коллизии - меньше персонажа для приятной игры
      keysPressed: {},

      lasers: [],
      laserIdCounter: 0,

      lastDashTime: 0, // Для отслеживания времени последнего рывка
      dashCooldown: 1000, // Кулдаун рывка в миллисекундах
      dashDistance: 50, // Расстояние рывка
      isDashing: false, // Флаг для отображения эффекта рывка
      dashIndicatorOpacity: 0, // Прозрачность индикатора рывка

      startTime: null,
      elapsedTime: 0,
      timerInterval: null,
      level: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.elapsedTime / 60000);
      const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
      const milliseconds = Math.floor(this.elapsedTime % 1000);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(
        milliseconds
      ).padStart(3, '0')}`;
    },
  },
  methods: {
    calculateLaserPath(x, y, angle, reflections) {
      const path = [];
      let currentX = x;
      let currentY = y;
      let currentAngle = angle;
      const fieldWidth = 400;
      const fieldHeight = 400;

      for (let i = 0; i < reflections; i++) {
        const rad = (Math.PI / 180) * currentAngle;
        const cosTheta = Math.cos(rad);
        const sinTheta = Math.sin(rad);
        const tValues = [];

        // Рассчитываем пересечения с границами
        // Левая граница x=0
        if (cosTheta !== 0) {
          const t = (0 - currentX) / cosTheta;
          if (t > 0) {
            tValues.push({ t: t, edge: 'left' });
          }
        }
        // Правая граница x=fieldWidth
        if (cosTheta !== 0) {
          const t = (fieldWidth - currentX) / cosTheta;
          if (t > 0) {
            tValues.push({ t: t, edge: 'right' });
          }
        }
        // Верхняя граница y=0
        if (sinTheta !== 0) {
          const t = (0 - currentY) / sinTheta;
          if (t > 0) {
            tValues.push({ t: t, edge: 'top' });
          }
        }
        // Нижняя граница y=fieldHeight
        if (sinTheta !== 0) {
          const t = (fieldHeight - currentY) / sinTheta;
          if (t > 0) {
            tValues.push({ t: t, edge: 'bottom' });
          }
        }

        // Находим наименьшее положительное t
        if (tValues.length === 0) {
          break; // Лазер покинул пределы поля
        }

        tValues.sort((a, b) => a.t - b.t);
        const { t: tMin, edge: hitEdge } = tValues[0];

        const nextX = currentX + cosTheta * tMin;
        const nextY = currentY + sinTheta * tMin;

        path.push({
          x: currentX,
          y: currentY,
          angle: currentAngle,
          length: tMin,
        });

        // Обновляем позицию и угол для следующего сегмента
        currentX = nextX;
        currentY = nextY;

        // Отражаем угол в зависимости от столкновения с границей
        if (hitEdge === 'left' || hitEdge === 'right') {
          currentAngle = 180 - currentAngle;
        } else if (hitEdge === 'top' || hitEdge === 'bottom') {
          currentAngle = -currentAngle;
        }
      }

      return path;
    },

    // Метод для расчёта градиента прозрачности
    calculateOpacityGradient(totalLength) {
      const gradient = [];
      const steps = 100; // Количество шагов в градиенте
      for (let i = 0; i <= steps; i++) {
        const opacity = 1 - i / steps;
        gradient.push(opacity);
      }
      return gradient;
    },

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
    spawnLaser(array) {
      const id = this.laserIdCounter++;

      // Случайный выбор типа лазера
      const laserTypeRandom = Math.floor(Math.random() * array.length);
      let laserType = array[laserTypeRandom];

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
        reflectionsLeft: 4,
        path: [],
      };

      if (laserType === 'blue') {
        // Настройки для синих лазеров
        laser.x0 = point1.x;
        laser.y0 = point1.y;
        laser.rotationDirection = Math.random() < 0.5 ? -1 : 1; // -1 для влево, 1 для вправо
        laser.initialAngle = angle;
        laser.rotationAmount = laser.rotationDirection * 45; // Поворот на 45 градусов
        laser.finalAngle = laser.initialAngle + laser.rotationAmount;
        laser.rotationStartTime = Date.now();
        laser.rotationDuration = 3000; // Общее время вращения (1 секунда подготовки + 2 секунды огня)
      } else if (laserType === 'green') {
        // Настройки для зелёных лазеров
        laser.creationTime = Date.now();
        laser.isTracking = true; // Первую секунду следит за игроком
        laser.trackingDuration = 1000; // 1 секунда
        laser.preparationDuration = 2000; // 2 секунды подготовки
        laser.isActive = false; // Станет активным после подготовки
      } else if (laserType === 'purple') {
        // Настройки для фиолетового лазера
        laser.preparationTime = 2000; // 2 секунды подготовки
        laser.activeTime = 1000; // 1 секунда активного состояния
        laser.creationTime = Date.now();
        laser.isReflecting = false;
        laser.initialX = laser.x;
        laser.initialY = laser.y;
        laser.initialAngle = laser.angle;
        laser.opacityGradient = this.calculateOpacityGradient(laser.width);
        laser.isActive = false; // Лазер не активен в фазе подготовки
        // Генерируем путь лазера сразу, включая отражения
        laser.path = this.calculateLaserPath(
          laser.x,
          laser.y,
          laser.angle,
          laser.reflectionsLeft + 1 // +1, т.к. исходный лазер тоже считается
        );
      }

      this.lasers.push(laser);

      // Настройка времени активации и длительности выстрела
      let activationDelay;
      let activeDuration;
      if (laserType === 'red') {
        activationDelay = 1000; // 1 секунда
        activeDuration = 200; // Красный лазер активен 0.2 сек
      } else if (laserType === 'yellow') {
        activationDelay = 1000; // 1 секунда
        activeDuration = 3000; // Жёлтый лазер активен 3 сек
      } else if (laserType === 'blue') {
        activationDelay = 1000; // 1 секунда
        activeDuration = 2000; // Синий лазер активен 2 сек
      } else if (laserType === 'green') {
        activationDelay = 0; // Зеленый лазер сразу начинает подготовку
        activeDuration = 200; // Зеленый лазер активен 0.2 сек после подготовки
      }

      if (laserType === 'green') {
        // Для зелёного лазера используем особую логику
        setTimeout(() => {
          laser.isActive = true; // Лазер выстреливает

          // Обработка коллизии во время активного состояния
          const collisionInterval = setInterval(() => {
            if (
              this.circleIntersectsRotatedRect(
                {
                  x: this.playerX + this.collisionRadius,
                  y: this.playerY + this.collisionRadius,
                  r: this.collisionRadius,
                },
                laser
              )
            ) {
              this.endGame();
            }
          }, 16);

          // Деактивация лазера после выстрела
          setTimeout(() => {
            laser.isActive = false;

            clearInterval(collisionInterval);

            // Удаление лазера
            setTimeout(() => {
              this.lasers = this.lasers.filter((l) => l.id !== id);
            }, 200);
          }, activeDuration);
        }, laser.preparationDuration);
      } else if (laserType !== 'purple') {
        // Обычная логика для других лазеров (кроме фиолетового)
        setTimeout(() => {
          laser.isActive = true;

          // Обработка коллизии во время активного состояния
          const collisionInterval = setInterval(() => {
            if (
              this.circleIntersectsRotatedRect(
                {
                  x: this.playerX + this.collisionRadius,
                  y: this.playerY + this.collisionRadius,
                  r: this.collisionRadius,
                },
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
      }
      // Для фиолетового лазера обработка происходит в updateLasers
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

    updateLasers() {
      const now = Date.now();
      const fieldWidth = 400;
      const fieldHeight = 400;

      this.lasers.forEach((laser) => {
        if (laser.color === 'purple') {
          const elapsed = now - laser.creationTime;

          if (elapsed < laser.preparationTime) {
            // Фаза подготовки
            laser.isActive = false; // Лазер не активен (тёмный)
            laser.isReflecting = false;
            // Обновляем позицию и длину лазера на основе первого сегмента пути
            const firstSegment = laser.path[0];
            laser.x = firstSegment.x;
            laser.y = firstSegment.y;
            laser.angle = firstSegment.angle;
            laser.width = firstSegment.length;
          } else if (elapsed < laser.preparationTime + laser.activeTime) {
            // Фаза активации
            laser.isActive = true; // Лазер становится ярким
            laser.isReflecting = true;

            // Обработка коллизий во время активного состояния
            laser.path.forEach((segment) => {
              if (
                this.circleIntersectsRotatedRect(
                  {
                    x: this.playerX + this.collisionRadius,
                    y: this.playerY + this.collisionRadius,
                    r: this.collisionRadius,
                  },
                  {
                    x: segment.x,
                    y: segment.y,
                    width: segment.length,
                    height: laser.height,
                    angle: segment.angle,
                  }
                )
              ) {
                this.endGame();
              }
            });
          } else {
            // Лазер завершил свою работу
            laser.isActive = false;
            // Удаление лазера
            this.lasers = this.lasers.filter((l) => l.id !== laser.id);
          }
        } else if (laser.color === 'blue' || laser.color === 'green') {
          // Лазер синий или зелёный, обновляем угол и длину на протяжении всей жизни
          if (laser.color === 'blue') {
            // Существующая логика для синего лазера
            const elapsed = now - laser.rotationStartTime;
            const rotationDuration = laser.rotationDuration; // Общее время вращения

            if (elapsed < rotationDuration) {
              // Интерполируем угол
              const t = elapsed / rotationDuration;
              laser.angle = laser.initialAngle + laser.rotationAmount * t;
            } else {
              // Вращение завершено
              laser.angle = laser.finalAngle;
            }
          } else if (laser.color === 'green') {
            const elapsed = now - laser.creationTime;

            if (elapsed < laser.trackingDuration) {
              // Первую секунду лазер следит за игроком
              const dx = this.playerX + this.playerRadius - laser.x;
              const dy = this.playerY + this.playerRadius - laser.y;
              laser.angle = Math.atan2(dy, dx) * (180 / Math.PI);
            } else if (elapsed < laser.preparationDuration) {
              // Вторую секунду лазер стоит на месте (ничего не делаем)
            } else {
              // Лазер выстреливает, обработка происходит в setTimeout внутри spawnLaser
            }
          }

          // Теперь обновляем позицию и длину лазера для синего и зелёного лазеров
          const points = this.getLineRectangleIntersections(
            laser.x,
            laser.y,
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
    startGame() {
      this.isPlaying = true;
      this.startTime = Date.now();
      this.elapsedTime = 0;

      // Запуск таймера
      this.timerInterval = setInterval(() => {
        this.elapsedTime = Date.now() - this.startTime;
      }, 10);
    },
    endGame() {
      this.isPlaying = false;

      // Остановка таймера
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.sendScoreToServer()
      }
    },

    spawnInterval(array, time, count) {
      this.level = 1;
      const interval = setInterval(() => {
        this.spawnLaser(array);
      }, time / count);

      setTimeout(() => {
        clearInterval(interval);
        this.level = null;
      }, time);
    },
    sendScoreToServer() {
      axios.post('http://localhost:8000/api/user/update/score/', {
        score: this.elapsedTime,
      }, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}` // Используйте токен аутентификации
        }
      })
      .then(response => {
        console.log('Score sent successfully:', response.data);
      })
      .catch(error => {
        console.error('Error sending score:', error);
      });
   },
    levels() {
      if (this.level) {
        return;
      }

      // Конфигурация уровней - ТУТ ИСПРАВИТЬ ЧТОБЫ И КРАСИВО БЫЛО (В ТАЙМИНГ) И СЛОЖНОТЬ НЕ ТАК ВОЗРОСЛА
      const levelConfig = [
        { start: 0, end: 3000, lasers: { red: 5 } },
        { start: 5000, end: 7000, lasers: { yellow: 4 } },
        { start: 10000, end: 13000, lasers: { blue: 3 } },
        { start: 15000, end: 18000, lasers: { green: 2 } },
        { start: 20000, end: 23000, lasers: { purple: 1 } },
        { start: 25000, end: 28000, lasers: { red: 1, yellow: 1, blue: 1 } },
        { start: 30000, end: 33000, lasers: { red: 1, yellow: 1, blue: 1, green: 1 } },
        { start: 35000, end: Infinity, lasers: { red: 1, yellow: 1, blue: 1, green: 1, purple: 1 } },
      ];

      // Определяем текущий уровень на основе времени
      const currentLevel = levelConfig.find(
        (level) => this.elapsedTime >= level.start && this.elapsedTime < level.end
      );

      if (currentLevel) {
        const laserCounts = currentLevel.lasers;

        // Запускаем указанные типы лазеров с нужным количеством
        Object.entries(laserCounts).forEach(([laserType, count]) => {
          this.spawnInterval([laserType], 1000, count); // Интервал 1000 мс, можно подправить
        });
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.startGame();

    const gameLoop = () => {
      if (this.isPlaying) {
        this.movePlayer();
        this.updateLasers();
        this.score++;

        // Обновляем dashIndicatorOpacity
        const now = Date.now();
        const timeSinceLastDash = now - this.lastDashTime;

        if (timeSinceLastDash < 700) {
          this.dashIndicatorOpacity = 0;
        } else if (timeSinceLastDash < this.dashCooldown) {
          // Начинаем появляться за 300 мс до окончания кд
          const t = (timeSinceLastDash - 700) / (this.dashCooldown - 700);
          this.dashIndicatorOpacity = t * 0.1;
        } else {
          this.dashIndicatorOpacity = 0.1;
        }

        requestAnimationFrame(gameLoop);
      }
    };
    gameLoop();
    this.levels();
    setInterval(this.levels, 10);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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

.time-info {
  margin-bottom: 20px;
  font-size: 30px;
}

.player {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
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

.dash-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s linear;
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
  background-color: rgba(64, 224, 208, 0.2);
  box-shadow: 0 0 5px rgba(64, 224, 208, 0.3); /* Тусклое синее свечение */
}

.laser.blue.active {
  background-color: rgba(64, 224, 208, 1);
  box-shadow: 0 0 15px rgba(64, 224, 208, 0.8); /* Яркое синее свечение */
}

/* Новый стиль для зелёного лазера */
.laser.green {
  background-color: rgba(0, 255, 0, 0.1); /* Едва видимый зелёный */
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
}

.laser.green.active {
  background-color: rgba(0, 255, 0, 1); /* Яркий зелёный при выстреле */
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
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

.laser.purple {
  background-color: rgba(128, 0, 128, 0.1); /* Тёмный фиолетовый в фазе подготовки */
  box-shadow: 0 0 5px rgba(128, 0, 128, 0.3);
}

.laser.purple.preparing {
  background-image: linear-gradient(
    to right,
    rgba(128, 0, 128, 0.5) 0%,
    rgba(128, 0, 128, 0) 100%
  );
  background-size: 10px 100%;
  background-repeat: repeat;
  background-position: 0 0;
  animation: dashAnimation 1s linear infinite;
}

@keyframes dashAnimation {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 0;
  }
}

.laser.purple.active {
  background-color: rgba(128, 0, 128, 1); /* Яркий фиолетовый при выстреле */
  box-shadow: 0 0 15px rgba(128, 0, 128, 0.8);
}
</style>
