<template>
    <div id="app">
        <!-- <img src="./assets/logo.png"> -->
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style>
html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
#info {
    position: absolute;
    top: 0px;
    left: 50%;
    margin-left: -90px;
    color: #fff;
    font-size: 13px;
    letter-spacing: 1px;
    text-align: center;
    line-height: 24px;
    padding: 10px 0;
}
#info a {
    text-decoration: none;
    color: yellow;
}
@media screen and (max-width: 640px) {
    .dg.ac {
        top: 48px !important;
    }
}
@media screen and (min-width: 640px) {
    .dg.ac {
        top: 0 !important;
    }
}
/* #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
} */
</style>
