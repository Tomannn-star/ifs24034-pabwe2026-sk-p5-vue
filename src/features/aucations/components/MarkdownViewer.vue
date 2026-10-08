<template>
  <div class="prose max-w-none text-slate-700 leading-relaxed">
    <div ref="viewerEl"></div>
    <div v-if="fallbackMode" class="whitespace-pre-wrap">{{ content }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

const viewerEl = ref(null);
const fallbackMode = ref(false);
let viewerInstance = null;

onMounted(() => {
  try {
    if (viewerEl.value && Editor.factory) {
      viewerInstance = Editor.factory({
        el: viewerEl.value,
        viewer: true,
        initialValue: props.content || "",
      });
    } else {
      fallbackMode.value = true;
    }
  } catch (e) {
    fallbackMode.value = true;
  }
});

watch(
  () => props.content,
  (newVal) => {
    if (viewerInstance && viewerInstance.setMarkdown) {
      viewerInstance.setMarkdown(newVal || "");
    }
  }
);
</script>

