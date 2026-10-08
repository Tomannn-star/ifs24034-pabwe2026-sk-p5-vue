<template>
  <div>
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
      data-testid="backdrop"
    ></div>

    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-200 lg:hidden">
        <div class="flex items-center gap-2">
          <img :src="'/logo.svg'" alt="Delcom Logo" class="w-8 h-8" />
          <span class="font-bold text-blue-600">Delcom Auction</span>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          aria-label="Close Sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="p-4 space-y-1.5">
        <RouterLink
          to="/"
          exact-active-class="bg-blue-50 text-blue-600 font-semibold"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Semua Lelang</span>
        </RouterLink>

        <RouterLink
          to="/users"
          active-class="bg-blue-50 text-blue-600 font-semibold"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Daftar Pengguna</span>
        </RouterLink>

        <RouterLink
          to="/profile"
          active-class="bg-blue-50 text-blue-600 font-semibold"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profil Saya</span>
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);
</script>

