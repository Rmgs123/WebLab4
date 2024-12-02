<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

let currentZoomFactor = 1;

function handleKeyDown(event: KeyboardEvent) {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  if (isCtrlOrCmd) {
    if (event.key === '=' || event.key === '+') {
      event.preventDefault();
      currentZoomFactor = Math.min(1.5, currentZoomFactor + 0.2);
      window.electronAPI.setZoomFactor(currentZoomFactor);
    } else if (event.key === '-') {
      event.preventDefault();
      currentZoomFactor = Math.max(0.5, currentZoomFactor - 0.2);
      window.electronAPI.setZoomFactor(currentZoomFactor);
    } else if (event.key === '0') {
      event.preventDefault();
      currentZoomFactor = 1;
      window.electronAPI.setZoomFactor(currentZoomFactor);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>


<template>
  <router-view>
  </router-view>
</template>

<style lang="css">
  @import url('https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&family=Jockey+One&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Orbitron:wght@400..900&family=Permanent+Marker&display=swap');
  body {
    margin: 0;
    height: 100%;
    padding: 0;
    font-family: "Orbitron", sans-serif;
    background-color: #000;
    color: #7f9e9f;
    scrollbar-width: thin;
    scrollbar-color: #3a3a3a #1e1e1e;
  }

  #app {
    display: flex;
    justify-content: center;
    align-items: center;
  }

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(58, 58, 58, 0.5);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }

  ::-webkit-scrollbar-corner {
    background: transparent;
  }
</style>
