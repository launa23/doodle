<script setup lang="ts">
useSeoMeta({
  title: 'Nguệch Ngoạc',
  description: 'Nguệch Ngoạc là một ứng dụng web cho phép bạn tạo, nâng cao và chia sẻ các bức vẽ của mình với thế giới. Sử dụng sức mạnh của Cloudflare R2 và Cloudflare AI để lưu trữ và nâng cao các bức vẽ của bạn.',
  ogTitle: 'Nguệch Ngoạc',
  ogImage: 'https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2RyYXcubnV4dC5kZXYiLCJpYXQiOjE3MTgwMTc3OTF9.ORrHGOCvTaxN7Lk24swRO7k-mrHmExypBquOA8FUlyg.jpg?theme=light',
  twitterCard: 'summary_large_image',
})
useHead({
  link: [
    { rel: 'icon', type: 'image/jpeg', href: '/icon.jpg' },
  ],
  meta: [
    { name: 'google-site-verification', content: 'ocIv8ZYQ5s35CIAYVpjPYyhBnWu7mo0JpdzOeWV4PZs' },
  ],
})
</script>

<template>
  <UApp>
    <AppHeader />
    <UContainer>
      <main class="min-h-[calc(100vh-192px)]">
        <NuxtPage />
      </main>
    </UContainer>
    <AppFooter />
  </UApp>
</template>
