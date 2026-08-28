<script setup>
import iconImg from '~/assets/img/icon.jpg'

const { user, loggedIn, clear } = useUserSession()
const config = useRuntimeConfig()
const colorMode = useColorMode()

const isAdmin = computed(() => {
  if (!loggedIn.value || !user.value) return false
  const adminEmail = config.public?.adminEmail
  if (adminEmail) {
    return user.value.email === adminEmail || user.value.id === adminEmail
  }
  return true
})

// Computed
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <header class="border-b border-(--ui-border) -mb-px sticky top-0 z-50 border-none md:pt-8 md:max-w-2xl mx-auto bg-transparent backdrop-blur-none">
    <UContainer class="flex items-center justify-between gap-3 h-16 md:rounded-full border-b md:border border-(--ui-border-muted) bg-(--ui-bg-muted)">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 flex-shrink-0 font-bold text-xl"
      >
        <img
          :src="iconImg"
          alt="Nguệch Ngoạc"
          class="w-7 h-7 rounded-full object-cover"
        >
        <h3>Nguệch Ngoạc</h3>
      </NuxtLink>
      <div class="flex items-center justify-end lg:flex-1 gap-1.5">
        <ClientOnly v-if="!colorMode?.forced">
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
            color="neutral"
            variant="ghost"
            @click="isDark = !isDark"
          />

          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
        <UButton
          to="/draw"
          icon="i-ph-pencil"
          class="shrink-0"
        >
          Vẽ
        </UButton>
        <UButton
          v-if="loggedIn && isAdmin"
          to="/manage"
          color="neutral"
          variant="subtle"
          icon="i-ph-shield-check-duotone"
          title="Quản trị bức vẽ (Admin)"
          class="shrink-0 whitespace-nowrap"
        >
          <span class="inline">Quản lý</span>
        </UButton>
        <UButton
          v-if="loggedIn"
          color="neutral"
          variant="ghost"
          icon="i-ph-power"
          title="Đăng xuất"
          @click="clear"
        />
      </div>
    </UContainer>
  </header>
</template>
