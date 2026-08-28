<script setup lang="ts">
import type { BlobObject } from '@nuxthub/core'
import { UseTimeAgo } from '@vueuse/components'

const { user, loggedIn } = useUserSession()
const config = useRuntimeConfig()
const toast = useToast()

const { data, refresh } = await useFetch('/api/drawings', {
  deep: true,
})

const loadingPathname = ref<string | null>(null)
const toggledDrawings = ref<Record<string, boolean>>({})

// Check Admin status based on NUXT_ADMIN_EMAIL or user email/id
const isAdmin = computed(() => {
  if (!loggedIn.value || !user.value) return false
  const adminEmail = config.public?.adminEmail
  // If adminEmail is defined in env, check matching email
  if (adminEmail) {
    return user.value.email === adminEmail || user.value.id === adminEmail
  }
  // Default to allowing logged-in user if no specific NUXT_ADMIN_EMAIL is set, or check admin role
  return true
})

// Drawings list: Admin sees all drawings
const drawingsList = computed(() => {
  if (!data.value?.blobs) return []
  return data.value.blobs
})

function toggleDrawing(pathname: string) {
  toggledDrawings.value[pathname] = !toggledDrawings.value[pathname]
}

async function deleteDrawing(drawing: BlobObject) {
  if (!confirm('Bạn có chắc chắn muốn xóa bức vẽ này không? Hành động này không thể hoàn tác.')) {
    return
  }

  loadingPathname.value = drawing.pathname
  try {
    const cleanPath = drawing.pathname.replace(/^drawings\//, '')
    await $fetch(`/api/drawings/${cleanPath}`, {
      method: 'DELETE',
    })

    toast.add({
      title: 'Đã xóa bức vẽ thành công!',
      color: 'success',
    })

    // Remove from local list
    if (data.value?.blobs) {
      data.value.blobs = data.value.blobs.filter(b => b.pathname !== drawing.pathname)
    }
  } catch (err: any) {
    toast.add({
      title: 'Lỗi khi xóa bức vẽ',
      description: err?.data?.message || err?.message || 'Có lỗi xảy ra.',
      color: 'error',
    })
  } finally {
    loadingPathname.value = null
  }
}
</script>

<template>
  <div class="my-8 max-w-6xl mx-auto">
    <!-- Unauthenticated View -->
    <div
      v-if="!loggedIn"
      class="flex flex-col items-center justify-center py-16 text-center gap-4"
    >
      <UIcon name="i-ph-lock-key-duotone" class="w-16 h-16 text-(--ui-text-muted)" />
      <h2 class="text-2xl font-bold">Vui lòng đăng nhập</h2>
      <p class="text-(--ui-text-muted) max-w-md">
        Bạn cần đăng nhập để quản lý và xem danh sách các bức vẽ của mình.
      </p>
      <UButton
        to="/auth/google"
        icon="i-logos-google-icon"
        size="lg"
        color="neutral"
        variant="subtle"
        external
      >
        Đăng nhập bằng Google
      </UButton>
    </div>

    <!-- Access Denied View for Non-Admin -->
    <div
      v-if="loggedIn && !isAdmin"
      class="flex flex-col items-center justify-center py-16 text-center gap-4"
    >
      <UIcon name="i-ph-shield-warning-duotone" class="w-16 h-16 text-amber-500" />
      <h2 class="text-2xl font-bold">Quyền truy cập bị từ chối</h2>
      <p class="text-(--ui-text-muted) max-w-md">
        Trang này chỉ dành riêng cho tài khoản Quản trị viên (Admin). Bạn không có quyền truy cập trang này.
      </p>
      <UButton
        to="/"
        icon="i-ph-house-duotone"
        color="neutral"
        variant="subtle"
      >
        Về trang chủ
      </UButton>
    </div>

    <!-- Admin Management View -->
    <div v-else-if="loggedIn && isAdmin" class="space-y-6">
      <div class="flex items-center justify-between border-b border-(--ui-border) pb-4">
        <div>
          <h1 class="text-2xl font-bold">Quản trị bức vẽ (Admin Dashboard)</h1>
          <p class="text-xs text-(--ui-text-muted) mt-1">
            Tổng số tác phẩm trên hệ thống: <span class="font-semibold text-(--ui-text)">{{ drawingsList.length }}</span> bức vẽ
          </p>
        </div>
        <UButton
          to="/draw"
          icon="i-ph-pencil-line"
          color="primary"
        >
          Vẽ bức mới
        </UButton>
      </div>

      <!-- Empty State -->
      <div
        v-if="drawingsList.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-(--ui-border) rounded-xl"
      >
        <UIcon name="i-ph-palette-duotone" class="w-12 h-12 text-(--ui-text-muted)" />
        <h3 class="font-semibold text-lg">Chưa có bức vẽ nào</h3>
        <p class="text-xs text-(--ui-text-muted)">
          Chưa có bức vẽ nào được đăng tải lên hệ thống.
        </p>
      </div>

      <!-- Drawings Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
      >
        <div
          v-for="drawing in drawingsList"
          :key="drawing.pathname"
          class="flex flex-col gap-2 bg-(--ui-bg-elevated) p-2.5 rounded-xl border border-(--ui-border-muted) shadow-xs"
        >
          <div
            class="group relative w-full aspect-square cursor-pointer select-none rounded-lg overflow-hidden bg-black/5"
            @click="toggleDrawing(drawing.pathname)"
          >
            <img
              :src="drawing.customMetadata?.url || `/drawings/${drawing.pathname}`"
              :alt="drawing.customMetadata?.description || drawing.pathname"
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <img
              v-if="drawing.customMetadata?.aiImage"
              :src="drawing.customMetadata?.aiImageUrl || `/drawings/${drawing.customMetadata?.aiImage}`"
              :alt="`Ảnh AI ${drawing.pathname}`"
              class="w-full h-full object-cover absolute inset-0 transition duration-200 group-hover:opacity-100"
              :class="toggledDrawings[drawing.pathname] ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
            >
          </div>

          <!-- Info & Actions -->
          <div class="flex flex-col gap-2 pt-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold truncate max-w-[110px]">
                {{ drawing.customMetadata?.userName || 'Tác giả' }}
              </span>
              <UseTimeAgo
                v-slot="{ timeAgo }"
                :time="new Date(drawing.customMetadata?.uploadedAt || drawing.uploadedAt)"
              >
                <span class="text-[11px] text-(--ui-text-muted)">{{ timeAgo }}</span>
              </UseTimeAgo>
            </div>
            <div class="flex items-center justify-end pt-1 border-t border-(--ui-border-muted)">
              <UButton
                color="error"
                variant="subtle"
                size="xs"
                icon="i-ph-trash-duotone"
                :loading="loadingPathname === drawing.pathname"
                label="Xóa tác phẩm"
                @click="deleteDrawing(drawing)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
