<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <main id="main-content" role="main" class="p-8 md:p-12 flex flex-col justify-center">
        <header class="mb-6 flex items-center gap-3">
          <img :src="'/logo.svg'" alt="Delcom Logo" class="w-10 h-10" />
          <span class="text-2xl font-bold text-blue-600">Delcom Auction</span>
        </header>
        <RouterView />
      </main>
      <aside class="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12" aria-label="Informasi Delcom Auction">
        <h2 class="text-3xl font-extrabold mb-4 text-center">Lelang Online Terpercaya</h2>
        <p class="text-blue-100 text-center leading-relaxed">
          Temukan dan tawar berbagai barang impian dengan sistem pelelangan terbuka yang aman dan transparan di lingkungan Delcom.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

