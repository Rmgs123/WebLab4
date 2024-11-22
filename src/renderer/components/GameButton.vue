<template>
    <button class="btn">
        <slot></slot>
    </button>

</template>

<script>
    
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500&family=Roboto:wght@700&display=swap');

.btn {
    background: none;
    font-size: 20px;
    color: #2f1e1e;
    margin-top: 10px;
    border: 3px solid #7f9e9f;
    border-radius: 10px;
    background: #7f9e9f;
    padding: 10px 25px;
    font-family: 'Comfortaa', sans-serif;
    font-size: 26px;
    font-weight: 700;
}
.btn:hover {
    background-color: #0a2d2b;
    color: gray;
    border-color: #0a2d2b;
}

.btn:focus {
    outline: none;
}
</style>