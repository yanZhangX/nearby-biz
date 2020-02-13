<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  // wxBindingList
  export default {
    name: 'app'
  }
</script>

<style lang="scss">
  html{
    height: 100%;
  }
  body{
    margin: 0;
    padding: 0;
    height:100%;
    background: #eef1f6;
  }
  #app{
    height: 100%;
  }

</style>
