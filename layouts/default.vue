
<template>
  <div>
      <div class="header">
          <MainMenu />
      </div>
      <div class="content">
          <slot />
      </div>
  </div>
</template>
<style scoped>
.header {
  padding: 15px;
  border-bottom: 1px solid #EEE;
}
.content {
  padding: 15px;
}
</style>