<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">Buat Akun Baru</h1>
    <p class="text-slate-600 mb-6 text-sm">Daftarkan akun untuk mulai mengikuti lelang di Delcom.</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="register-name-input" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
        <input
          id="register-name-input"
          name="name"
          data-testid="register-name-input"
          type="text"
          v-model="name"
          required
          placeholder="Nama Anda"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="register-email-input" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          id="register-email-input"
          name="email"
          data-testid="register-email-input"
          type="email"
          v-model="email"
          required
          placeholder="nama@delcom.org"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="register-password-input" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
        <input
          id="register-password-input"
          name="password"
          data-testid="register-password-input"
          type="password"
          v-model="password"
          required
          placeholder="Minimal 6 karakter"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="register-confirm-password-input" class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
        <input
          id="register-confirm-password-input"
          name="confirmPassword"
          data-testid="register-confirm-password-input"
          type="password"
          v-model="confirmPassword"
          required
          placeholder="Ulangi kata sandi"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        id="register-submit-button"
        data-testid="register-submit-button"
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
      >
        <span v-if="authStore.isAuthRegister">Mendaftarkan...</span>
        <span v-else>Daftar Sekarang</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Sudah memiliki akun?
      <RouterLink to="/auth/login" class="text-blue-600 font-semibold hover:underline">
        Masuk di sini
      </RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  if (!name.value || !email.value || !password.value) {
    await showErrorDialog("Semua kolom wajib diisi!");
    return;
  }
  if (password.value !== confirmPassword.value) {
    await showErrorDialog("Konfirmasi kata sandi tidak cocok!");
    return;
  }
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    router.push("/auth/login");
  } catch (error) {
    // handled in store
  }
}
</script>

