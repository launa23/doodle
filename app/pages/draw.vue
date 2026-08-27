<script setup lang="ts">
const { loggedIn } = useUserSession()
const authProviders = useState<{ google: boolean, github: boolean }>('authProviders')
const toast = useToast()
const saving = ref(false)
const drawing = ref('')

function onDraw(dataURL: string) {
  drawing.value = dataURL
}

async function save(dataURL: string) {
  if (saving.value) return
  saving.value = true
  // Transform the dataURL to a Blob
  const blob = await fetch(dataURL).then(res => res.blob())
  // Create the form data
  const form = new FormData()
  form.append('drawing', new File([blob], `drawing.jpg`, { type: 'image/jpeg' }))

  // Upload the file to the server
  await $fetch('/api/upload', {
    method: 'POST',
    body: form,
  })
    .then(() => {
      toast.add({
        title: 'Đã chia sẻ bức vẽ!',
        description: 'Bức vẽ của bạn đã được chia sẻ với mọi người.',
        color: 'success',
      })
      navigateTo('/')
    }).catch((err) => {
      toast.add({
        title: 'Không thể chia sẻ bức vẽ',
        description: err.data?.message || err.message,
        color: 'error',
      })
    })
  saving.value = false
}
</script>

<template>
  <div class="my-8">
    <div class="mx-auto max-w-[400px]">
      <p class="text-center pb-4">
        Tạo bức vẽ của bạn và chia sẻ với mọi người!
      </p>
      <div v-if="loggedIn">
        <DrawPad
          :saving="saving"
          class="max-w-[400px]"
          @save="save"
          @draw="onDraw"
        />
        <AIDraw :drawing="drawing" class="mt-4" />
      </div>
      <div
        v-else
        class="w-full max-w-sm space-y-6"
      >
        <div class="gap-y-6 flex flex-col">
          <div class="space-y-3">
            <UButton
              v-if="authProviders.google"
              to="/auth/google"
              label="Đăng nhập bằng Google"
              icon="i-logos-google-icon"
              color="neutral"
              variant="outline"
              size="lg"
              external
              block
            />
            <UButton
              v-if="authProviders.github"
              to="/auth/github"
              label="Đăng nhập bằng GitHub"
              icon="i-simple-icons-github"
              color="neutral"
              size="lg"
              external
              block
            />
            <UButton
              v-if="!authProviders.github && !authProviders.google"
              to="/auth/anonymous"
              label="Đăng nhập ẩn danh"
              icon="i-ph-mask-happy-duotone"
              color="neutral"
              size="lg"
              external
              block
            />
          </div>
        </div>
        <p
          v-if="authProviders.google || authProviders.github"
          class="text-center text-sm text-(--ui-text-muted)"
        >
          Không có thông tin cá nhân nào từ Google của bạn được lưu trữ.
          Chỉ các bức vẽ của bạn được lưu kèm tên người dùng và ảnh đại diện từ các nhà cung cấp này.
        </p>
      </div>
    </div>
  </div>
</template>
