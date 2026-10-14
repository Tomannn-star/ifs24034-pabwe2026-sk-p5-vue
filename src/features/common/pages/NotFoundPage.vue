<template>
  <main id="main-content" role="main" class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <div class="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
      <span class="text-4xl font-extrabold">404</span>
    </div>
    <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Halaman Tidak Ditemukan</h1>
    <p class="text-slate-600 max-w-md mb-8 text-sm">
      Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda masukkan salah.
    </p>
    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
    >
      Kembali ke Beranda
    </RouterLink>
  </main>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

