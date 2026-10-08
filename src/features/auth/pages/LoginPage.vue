<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">Masuk ke Akun Anda</h1>
    <p class="text-slate-600 mb-6 text-sm">Gunakan kredensial akun Delcom Anda untuk melanjutkan.</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="nama@delcom.org"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
      >
        <span v-if="authStore.isAuthLogin">Memproses...</span>
        <span v-else>Masuk</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Belum memiliki akun?
      <RouterLink to="/auth/register" class="text-blue-600 font-semibold hover:underline">
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  if (!email.value || !password.value) {
    await showErrorDialog("Email dan kata sandi wajib diisi!");
    return;
  }
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    router.push("/");
  } catch (error) {
    // handled in store
  }
}
</script>

