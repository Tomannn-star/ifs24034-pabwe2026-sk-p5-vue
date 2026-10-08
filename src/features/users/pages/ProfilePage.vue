<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Profil & Pengaturan Akun</h1>
      <p class="text-slate-600 text-sm">Kelola informasi data diri, foto profil, dan keamanan akun Anda.</p>
    </div>

    <div v-if="usersStore.isProfile" class="flex justify-center py-12" data-testid="profile-loading">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
        <img
          :src="usersStore.profile?.photo || '/default-avatar.png'"
          :alt="usersStore.profile?.name"
          class="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-sm"
          @error="handleImgError"
        />
        <div class="text-center sm:text-left flex-1">
          <h2 class="text-xl font-bold text-slate-900">{{ usersStore.profile?.name || '-' }}</h2>
          <p class="text-slate-600">{{ usersStore.profile?.email || '-' }}</p>
          <p class="text-xs text-slate-400 mt-1">
            Bergabung sejak: {{ formatDate(usersStore.profile?.created_at) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Ubah Data Diri</h3>
          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input
                id="name"
                v-model="name"
                type="text"
                required
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              :disabled="usersStore.isProfileUpdating"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              <span v-if="usersStore.isProfileUpdating">Menyimpan...</span>
              <span v-else>Simpan Perubahan</span>
            </button>
          </form>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Ganti Foto Profil</h3>
          <form @submit.prevent="handleUpdatePhoto" class="space-y-4">
            <div>
              <label for="photo" class="block text-sm font-medium text-slate-700 mb-1">Pilih Berkas Foto</label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                required
                class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              :disabled="usersStore.isPhotoUpdating || !photoFile"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              <span v-if="usersStore.isPhotoUpdating">Mengunggah...</span>
              <span v-else>Unggah Foto</span>
            </button>
          </form>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-lg">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Perbarui Kata Sandi</h3>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="oldPassword" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Saat Ini</label>
            <input
              id="oldPassword"
              v-model="oldPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label for="confirmNewPassword" class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            :disabled="usersStore.isPasswordUpdating"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            <span v-if="usersStore.isPasswordUpdating">Memproses...</span>
            <span v-else>Ubah Kata Sandi</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useUsersStore } from "../states/usersStore";
import { formatDate, showErrorDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();
const name = ref("");
const photoFile = ref(null);
const oldPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");

function handleImgError(e) {
  e.target.src = "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";
}

function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    photoFile.value = file;
  }
}

async function handleUpdateProfile() {
  if (!name.value) {
    await showErrorDialog("Nama tidak boleh kosong!");
    return;
  }
  await usersStore.updateProfile({ name: name.value });
}

async function handleUpdatePhoto() {
  if (!photoFile.value) {
    await showErrorDialog("Pilih file foto terlebih dahulu!");
    return;
  }
  const formData = new FormData();
  formData.append("photo", photoFile.value);
  await usersStore.updatePhoto(formData);
  photoFile.value = null;
}

async function handleChangePassword() {
  if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value) {
    await showErrorDialog("Seluruh kolom kata sandi wajib diisi!");
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    await showErrorDialog("Konfirmasi kata sandi baru tidak cocok!");
    return;
  }
  await usersStore.updatePassword({
    password: oldPassword.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmNewPassword.value,
  });
  oldPassword.value = "";
  newPassword.value = "";
  confirmNewPassword.value = "";
}

watch(
  () => usersStore.profile,
  (newProfile) => {
    if (newProfile?.name) {
      name.value = newProfile.name;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await usersStore.fetchProfile();
});
</script>

