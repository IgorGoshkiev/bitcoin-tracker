<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const year = (new Date).getFullYear()
const title = computed(() => `${route.meta.title} в ${year} г.`)

useHead({
  title: title
})
</script>