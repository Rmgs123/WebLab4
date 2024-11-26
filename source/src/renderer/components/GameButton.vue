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
@import url('https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&family=Jockey+One&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Orbitron:wght@400..900&family=Permanent+Marker&display=swap');

.btn {
  color: #daede9;
  margin-top: 10px;
  border: none;
  background: transparent;
  padding: 0;
  font-family: "Orbitron", sans-serif;;
  font-size: 36px;
  font-weight: 100;
  text-shadow: 0 0 25px #86b8ae;
  transition: text-shadow 0.17s ease, color 0.17s ease;
}

.btn:hover {
  color: #6accb9;
  text-shadow: 0 0 15px #86b8ae, 0 0 15px #86b8ae, 0 0 15px #86b8ae;
}

.btn:focus {
  outline: none;
}

.btn-content {
  padding: 10px 25px;
}
</style>