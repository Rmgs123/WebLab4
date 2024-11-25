<template>
  <button class="btn">
        <span class="btn-content">
          <slot></slot>
        </span>
  </button>

</template>

<script>

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&family=Jockey+One&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Permanent+Marker&display=swap');

.btn {
  color: #9dd5ca;
  margin-top: 10px;
  border: none;
  background: transparent;
  padding: 0;
  font-family: "Jaro", sans-serif;;
  font-size: 30px;
  font-weight: 100;
  transition: text-shadow 0.17s ease;
}

.btn:hover {
  text-shadow: 0 0 25px #c3dcd5;
}

.btn:focus {
  outline: none;
}

.btn-content {
  padding: 10px 25px;
}
</style>