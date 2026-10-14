<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <RouterLink to="/" class="flex items-center gap-2">
          <img :src="'/logo.svg'" alt="Delcom Logo" class="w-8 h-8" />
          <span class="text-xl font-bold text-blue-600 hidden sm:inline">Delcom Auction</span>
        </RouterLink>
      </div>

      <div class="flex items-center gap-4">
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <img
            :src="usersStore.profile?.photo || '/default-avatar.png'"
            :alt="usersStore.profile?.name || 'User'"
            class="w-9 h-9 rounded-full object-cover border border-slate-200"
            @error="handleImgError"
          />
          <div class="hidden md:block text-left">
            <div class="text-sm font-semibold text-slate-800">{{ usersStore.profile?.name || 'Pengguna' }}</div>
            <div class="text-xs text-slate-500">{{ usersStore.profile?.email || '' }}</div>
          </div>
        </RouterLink>

        <button
          type="button"
          @click="handleLogout"
          class="p-2 text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
          title="Keluar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits(["toggle-sidebar"]);

const authStore = useAuthStore();
const usersStore = useUsersStore();
const router = useRouter();

function handleImgError(e) {
  e.target.src = "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";
}

async function handleLogout() {
  const confirmed = await showConfirmDialog("Apakah Anda yakin ingin keluar?", "Konfirmasi Logout", "Ya, Keluar");
  if (confirmed) {
    await authStore.logout();
    router.push("/auth/login");
  }
}

onMounted(() => {
  if (!usersStore.profile) {
    usersStore.fetchProfile().catch(() => {});
  }
});
</script>

