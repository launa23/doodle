<script setup lang="ts">
import type { BlobObject } from '@nuxthub/core'
import { UseTimeAgo, vInfiniteScroll } from '@vueuse/components'

const { data } = await useFetch('/api/drawings', {
  // don't return a shallowRef as we mutate the array
  deep: true,
})

const loading = ref(false)
const toggledDrawings = ref<Record<string, boolean>>({})

function toggleDrawing(pathname: string) {
  toggledDrawings.value[pathname] = !toggledDrawings.value[pathname]
}

async function loadMore() {
  if (loading.value || !data.value?.hasMore) return
  loading.value = true

  const more = await $fetch(`/api/drawings`, {
    query: { cursor: data.value.cursor },
  })
  data.value.blobs.push(...more.blobs)
  data.value.cursor = more.cursor
  data.value.hasMore = more.hasMore
  loading.value = false
}

function drawingTitle(drawing: BlobObject) {
  const title = drawing.customMetadata?.description || ''
  if (!drawing.customMetadata?.aiImage) {
    return title + '\n[Không thể tạo hình ảnh bằng AI]'
  }
  return title
}
</script>

<template>
  <div class="my-3">
    <!-- Subtitle instruction line directly below header -->
    <div class="text-center mb-3 text-xs text-(--ui-text-muted) flex items-center justify-center gap-1.5 opacity-85">
      <UIcon name="i-ph-hand-tap-duotone" class="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Chạm vào ảnh</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
      <div
        v-for="drawing in data?.blobs"
        :key="drawing.pathname"
        class="flex flex-col gap-2"
      >
        <div
          class="group relative max-w-[400px] cursor-pointer select-none"
          :title="drawingTitle(drawing)"
          @click="toggleDrawing(drawing.pathname)"
        >
          <img
            :src="drawing.customMetadata?.url || `/drawings/${drawing.pathname}`"
            :alt="drawing.customMetadata?.description || drawing.pathname"
            class="w-full rounded aspect-square"
            loading="lazy"
          >
          <img
            v-if="drawing.customMetadata?.aiImage"
            :src="drawing.customMetadata?.aiImageUrl || `/drawings/${drawing.customMetadata?.aiImage}`"
            :alt="`Hình ảnh AI được tạo từ ${drawing.customMetadata?.description || drawing.pathname}`"
            :title="drawing.customMetadata?.description || ''"
            class="w-full rounded aspect-square absolute inset-0 transition duration-200 group-hover:opacity-100"
            :class="toggledDrawings[drawing.pathname] ? 'opacity-100' : 'opacity-0'"
            loading="lazy"
          >
        </div>
        <div class="flex items-center justify-between max-w-[400px]">
          <NuxtLink
            class="flex items-center gap-1"
            :to="drawing.customMetadata?.userUrl"
            target="_blank"
          >
            <UAvatar
              :src="drawing.customMetadata?.userAvatar"
              size="xs"
              icon="i-ph-mask-happy-duotone"
            />
            <span class="text-xs font-semibold">{{ drawing.customMetadata?.userName }}</span>
          </NuxtLink>
          <UseTimeAgo
            v-slot="{ timeAgo }"
            :time="new Date(drawing.customMetadata?.uploadedAt || drawing.uploadedAt)"
          >
            <span class="text-xs text-(--ui-text-muted)">{{ timeAgo }}</span>
          </UseTimeAgo>
        </div>
      </div>
    </div>
    <div
      v-if="data?.hasMore"
      v-infinite-scroll="[loadMore, { distance: 10, interval: 1000 }]"
      class="flex items-center justify-center mt-2 p-4"
    >
      <UButton
        color="neutral"
        variant="subtle"
        block
        size="md"
        :loading="loading"
        :label="loading ? 'Đang tải thêm bức vẽ...' : 'Tải thêm bức vẽ'"
        @click="loadMore"
      />
    </div>
  </div>
</template>
