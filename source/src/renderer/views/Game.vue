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

<script lang="ts">
    import { defineComponent } from "vue";
    import GameButton from "../components/GameButton.vue";
    import http from "../http_common";
    import User from "../typings/User";
    import axios from 'axios';

    export default defineComponent({
        name: 'Game',
        data() {
            return {
                isPlaying: true,
                userScore: 0,

                playerX: 190,
                playerY: 190,
                playerSpeed: 5,
                playerSpeedMultiplier: 0.25,
                playerRadius: 6,
                collisionRadius: 4, // Радиус для проверки коллизии - меньше персонажа для приятной игры
                keysPressed: {},
                user: null,

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
                musicInterval: null,
                audio: new Audio('../assets/musicunder.mp3'),
                isLevel: null,
                level: null,
                levelsSettings: [
                [['red']],[1000],[2],[10],
                [['orange']],[1000],[2],[5],
                [['yellow']],[1000],[5],[10],
                [['green']],[1000],[2],[10],
                [['blue']],[1000],[2],[5],
                [['cyan']],[1000],[2],[5],
                [['red'],['green']],[2000,1000],[2,2],[7,5],
                [['yellow'],['orange']],[1000,2000],[3,1],[9,4],
                [['blue'],['cyan']],[1000,1000],[2,2],[3,3],
                [['green'],['cyan'],['orange']],[1800,1000,1000],[2,1,1],[3,2,2],
                [['red'],['yellow']],[3800,1000],[3,9],[9,13],
                [['red','orange','yellow','green','blue','cyan']],[1000],[10],[12],
                ],
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
              if (['w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', 'shift', '7'].includes(key)) {
                this.keysPressed[key] = true;
              }
            },

            handleKeyUp(event) {
              const key = event.key.toLowerCase();
              if (['w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', 'shift', '7'].includes(key)) {
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
              const now = performance.now();
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
              this.isLevel += 1;
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
              let point1 = this.getRandomPointOnEdge(edge1);
              let point2;
              let angle=90;
              let laserLength=0,dx=0,dy=0;

              while (laserLength < 100){
                  point2 = this.getRandomPointOnEdge(edge2);
                  if (laserType === 'cyan'){
                    point2.x = 200;
                    point2.y = 200;
                  }
                  // Вычисляем угол между точками
                  dx = point2.x - point1.x;
                  dy = point2.y - point1.y;

                  angle = Math.atan2(dy, dx) * (180 / Math.PI);

                  // Вычисляем длину лазера
                   laserLength = Math.sqrt(dx * dx + dy * dy);

                  if (laserType === 'cyan'){
                    laserLength*=2;
                  }
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

              if (laserType === 'orange') {
                laser.x0 = point1.x;
                laser.y0 = point1.y;
                laser.direction = edge1%2===0 ? 0 : 1;
                laser.creationTime = performance.now();
                laser.duration = 3000;
                laser.movement = 0.15;
              } else if (laserType === 'blue') {
                // Настройки для синих лазеров
                laser.x0 = point1.x;
                laser.y0 = point1.y;
                laser.rotationDirection = Math.random() < 0.5 ? -1 : 1; // -1 для влево, 1 для вправо
                laser.initialAngle = angle;
                laser.rotationAmount = laser.rotationDirection * 30; // Поворот на 45 градусов
                laser.finalAngle = laser.initialAngle + laser.rotationAmount;
                laser.rotationStartTime = performance.now();
                laser.rotationDuration = 3000; // Общее время вращения (1 секунда подготовки + 2 секунды огня)
              } else if (laserType === 'cyan') {
                // Настройки для синих лазеров
                laser.x0 = point1.x;
                laser.y0 = point1.y;
                laser.rotationDirection = Math.random() < 0.5 ? -1 : 1; // -1 для влево, 1 для вправо
                laser.initialAngle = angle;
                laser.rotationAmount = laser.rotationDirection * 30; // Поворот на 45 градусов
                laser.finalAngle = laser.initialAngle + laser.rotationAmount;
                laser.rotationStartTime = performance.now();
                laser.rotationDuration = 3000;
              }else if (laserType === 'green') {
                // Настройки для зелёных лазеров
                laser.creationTime = performance.now();
                laser.isTracking = true; // Первую секунду следит за игроком
                laser.trackingDuration = 1000; // 1 секунда
                laser.preparationDuration = 2000; // 2 секунды подготовки
                laser.isActive = false; // Станет активным после подготовки
              } else if (laserType === 'purple') {
                // Настройки для фиолетового лазера
                laser.preparationTime = 2000; // 2 секунды подготовки
                laser.activeTime = 1000; // 1 секунда активного состояния
                laser.creationTime = performance.now();
                laser.isReflecting = false;
                laser.initialX = laser.x;
                laser.initialY = laser.y;
                laser.initialAngle = laser.angle;
                laser.opacityGradient = this.calculateOpacityGradient(laser.width);
                laser.isActive = false; // Лазер не активен в фазе подготовки
                laser.path = this.calculateLaserPath(
                  laser.x,
                  laser.y,
                  laser.angle,
                  laser.reflectionsLeft + 1 // +1, т.к. исходный лазер тоже считается
                );
              }

              this.lasers.push(laser);

              let activationDelay;
              let activeDuration;
              if (laserType === 'red') {
                activationDelay = 1000; // 1 секунда
                activeDuration = 200; // Красный лазер активен 0.2 сек
              } else if (laserType === 'orange') {
                activationDelay = 1000; // 1 секунда
                activeDuration = 2000; // Жёлтый лазер активен 3 сек
              }  else if (laserType === 'yellow') {
                activationDelay = 1000; // 1 секунда
                activeDuration = 3000; // Жёлтый лазер активен 3 сек
              } else if (laserType === 'blue') {
                activationDelay = 1000; // 1 секунда
                activeDuration = 2000; // Синий лазер активен 2 сек
              } else if (laserType === 'cyan') {
                activationDelay = 1000; // 1 секунда
                activeDuration = 2000; // Синий лазер активен 2 сек
              } else if (laserType === 'green') {
                activationDelay = 2000; // Зеленый лазер сразу начинает подготовку
                activeDuration = 200; // Зеленый лазер активен 0.2 сек после подготовки
              }

              if (laserType === 'purple'){return;}

              setTimeout(() => {
                laser.isActive = true;

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

                setTimeout(() => {
                    laser.isActive = false;


                    clearInterval(collisionInterval);
                    this.isLevel -= 1;
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
              if (this.keysPressed['7']){return false;}
              const rectWidth = rect.width;
              const rectHeight = rect.height;
              const rectAngle = rect.angle;

              const rectCenterX = rect.x;
              const rectCenterY = rect.y;

              const theta = (Math.PI / 180) * -rectAngle;

              const cosTheta = Math.cos(theta);
              const sinTheta = Math.sin(theta);

              const dx = circle.x - rectCenterX;
              const dy = circle.y - rectCenterY;

              const rotatedX = dx * cosTheta - dy * sinTheta;
              const rotatedY = dx * sinTheta + dy * cosTheta;

              const closestX = Math.max(0, Math.min(rectWidth, rotatedX));
              const closestY = Math.max(0, Math.min(rectHeight, rotatedY));

              const distanceX = rotatedX - closestX;
              const distanceY = rotatedY - closestY;
              const distanceSquared = distanceX * distanceX + distanceY * distanceY;

              return distanceSquared < this.collisionRadius * this.collisionRadius;
            },

            updateLasers() {
              const now = performance.now();
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

                    //if (elapsed<laser.preparationTime + 500){return;}
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
                } else if (laser.color === 'blue' || laser.color === 'cyan' || laser.color === 'green' || laser.color === 'orange') {
                  // Лазер синий или зелёный, обновляем угол и длину на протяжении всей жизни
                  if (laser.color === 'blue' || laser.color === 'cyan') {
                    const elapsed = now - laser.rotationStartTime;
                    const rotationDuration = laser.rotationDuration; // Общее время вращения
                    if (laser.color === 'cyan'){
                        laser.x = 200;
                        laser.y = 200;
                    }
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
                  } else if (laser.color === 'orange') {
                    const elapsed = now - laser.creationTime;

                    if (elapsed < laser.duration) {
                        if (laser.direction === 0){
                            laser.x = (laser.x + laser.movement);
                        } else if (laser.direction === 1){
                            laser.y = (laser.y + laser.movement);
                        }
                    }
                  }

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
                this.audio.play();
                this.musicInterval = setInterval(() => {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.audio.play();
                }, 156000);//время музыки

                this.isPlaying = true;
                this.startTime = performance.now();
                this.elapsedTime = 0;

                // Запуск таймера
                this.timerInterval = setInterval(() => {
                    this.elapsedTime = performance.now() - this.startTime;
                }, 10);
            },
            endGame() {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.isPlaying = false;

                // Остановка таймера
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    this.sendScoreToServer()
                }
                if (this.musicInterval) {
                    clearInterval(this.musicInterval);
                    this.audio.pause();
                    this.audio.currentTime = 0;
                }
            },

            spawnInterval(array, time, count) {
              this.isLevel += 1;
              const interval = setInterval(() => {
                this.spawnLaser(array);

              }, time / count);

              setTimeout(() => {
                clearInterval(interval);
                this.isLevel -=1;
              }, time);
            },

            sendScoreToServer() {
               if (this.elapsedTime > this.userScore) {
                    axios.post('http://localhost:8000/api/user/update/score/', {
                        score: this.elapsedTime,
                    }, {
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}` // Используйте токен аутентификации
                        }
                    })
                        .then(response => {
                            console.log('Score sent successfully:', response.data);
                            this.userScore = this.elapsedTime;
                        })
                        .catch(error => {
                            console.error('Error sending score:', error);
                        });
                } else {
                    console.log('Current score is not greater than the stored score. Not sending data.');
                }

            },

            levels() {
                let levelNumber = this.level*4;
                if (this.isLevel || !this.isPlaying){return;}

                let count = 0;

                for (let index=0;index<this.levelsSettings[levelNumber].length; index+=1){
                    this.spawnInterval(this.levelsSettings[levelNumber][index],
                    this.levelsSettings[levelNumber+1][index],this.levelsSettings[levelNumber+2][index]);

                    if (this.levelsSettings[levelNumber+2][index] >= this.levelsSettings[levelNumber+3][index]){
                        count+=1;
                    } else {
                        this.levelsSettings[levelNumber+2][index]+=2;
                    }
                }

                if (count === this.levelsSettings[levelNumber].length && levelNumber+4 != this.levelsSettings.length){
                    this.level+=1;
                }
            },
          },
      mounted() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        const token = localStorage.getItem('token');
         http.get('/profile/', {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then((response) => {
                console.log("API Response:", response.data);
                this.user = response.data;
                this.userScore = this.user.score; // Получаем score пользователя
            })
            .catch((e) => {
                console.log("Ошибка при получении данных:", e);
            });

        const FPS = 360;
        const FRAME_TIME = 1000/FPS;
        let lastFrameTime = performance.now();
        this.startGame();


        const gameLoop = (currentTime) => {
          const delta = currentTime-lastFrameTime;

          if (delta>=FRAME_TIME){
              lastFrameTime = currentTime;
              this.updateLasers();

              if (this.isPlaying) {
                this.playerSpeed = delta*this.playerSpeedMultiplier;
                this.movePlayer();
                this.updateLasers();


                // Обновляем dashIndicatorOpacity
                const now = performance.now();
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
              }
          }
          if (this.isPlaying) {
            requestAnimationFrame(gameLoop);
          }
        };

        requestAnimationFrame(gameLoop);
        this.levels();
        setInterval(this.levels, 100);
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
  user-select: none;
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
  border-radius: 2.5px;
}

.laser.red {
  background-color: rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
}

.laser.red.active {
  background-color: rgba(255, 0, 0, 1);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
}

.laser.yellow {
  background-color: rgba(255, 255, 0, 0.2);
  box-shadow: 0 0 5px rgba(255, 255, 0, 0.3);
}

.laser.yellow.active {
  background-color: rgba(255, 255, 0, 1);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.8);
}

.laser.blue {
  background-color: rgba(64, 224, 208, 0.2);
  box-shadow: 0 0 5px rgba(64, 224, 208, 0.3);
}

.laser.blue.active {
  background-color: rgba(64, 224, 208, 1);
  box-shadow: 0 0 15px rgba(64, 224, 208, 0.8);
}

.laser.cyan {
  background-color: rgba(0, 0, 224, 0.2);
  box-shadow: 0 0 5px rgba(0, 0, 224, 0.3);
}

.laser.cyan.active {
  background-color: rgba(0, 0, 224, 1);
  box-shadow: 0 0 15px rgba(0, 0, 224, 0.8);
}

/* Новый стиль для зелёного лазера */
.laser.green {
  background-color: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
}

.laser.green.active {
  background-color: rgba(0, 255, 0, 1);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
}

.laser.orange {
  background-color: rgba(255, 165, 0, 0.1);
  box-shadow: 0 0 5px rgba(255, 165, 0, 0.2);
}

.laser.orange.active {
  background-color: rgba(255, 165, 0, 1);
  box-shadow: 0 0 15px rgba(255, 165, 0, 0.8);
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
  background-color: rgba(128, 0, 128, 0.1);
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
  background-color: rgba(128, 0, 128, 1);
  box-shadow: 0 0 15px rgba(128, 0, 128, 0.8);
}
</style>
