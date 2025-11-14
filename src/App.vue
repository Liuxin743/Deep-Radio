<template>
  <div id="app">
    <div class="app-contanter">
    <Navbar />
    <router-view />
    <!-- <Footer class="footer"/> -->
    </div>

    
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
</script>

<style scoped>
#app {
  flex-direction: column;
   min-height: 100vh;
   background-color: #0f172a;
   display: flex;
   color: white;
}
.app-contanter{
   max-width: 1420px; /* 必须与导航栏的最大宽度一致 */
  margin: 0 left; /* 整体居中（若要完全靠左，改为 margin: 0） */
  width: 100%;
 /* padding-left: 1rem;  */
  /* padding-right: 1rem;  */
}
.footer{
  position: fixed;
  bottom: 0px;
}

</style>