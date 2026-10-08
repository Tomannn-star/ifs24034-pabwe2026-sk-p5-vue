<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Daftar Pengguna</h1>
        <p class="text-slate-600 text-sm">Lihat seluruh pengguna terdaftar dalam platform Delcom.</p>
      </div>
    </div>

    <div v-if="usersStore.isUsers" class="flex justify-center py-12" data-testid="loading">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="usersStore.users.length === 0" class="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
      Belum ada data pengguna.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in usersStore.users"
        :key="user.id"
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4"
      >
        <img
          :src="user.photo || '/default-avatar.png'"
          :alt="user.name"
          class="w-14 h-14 rounded-full object-cover border border-slate-200 bg-slate-100"
          @error="handleImgError"
        />
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-slate-900 truncate">{{ user.name }}</h3>
          <p class="text-sm text-slate-500 truncate">{{ user.email }}</p>
          <span class="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            Terdaftar: {{ formatDate(user.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { formatDate } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

function handleImgError(e) {
  e.target.src = "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";
}

onMounted(() => {
  usersStore.fetchUsers();
});
</script>

