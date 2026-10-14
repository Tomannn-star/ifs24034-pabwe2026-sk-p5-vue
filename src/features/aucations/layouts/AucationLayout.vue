<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex-1 flex">
      <SidebarComponent :is-open="sidebarOpen" @close="sidebarOpen = false" />
      <main id="main-content" role="main" class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const sidebarOpen = ref(false);
</script>

