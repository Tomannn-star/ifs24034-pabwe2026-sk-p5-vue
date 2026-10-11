<template>
  <div class="space-y-2">
    <div ref="editorEl" class="border border-slate-300 rounded-lg overflow-hidden bg-white"></div>
    <textarea
      v-if="fallbackMode"
      v-model="internalValue"
      rows="4"
      class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="Tulis deskripsi..."
    ></textarea>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editorEl = ref(null);
const internalValue = ref(props.modelValue);
const fallbackMode = ref(false);
let editorInstance = null;

onMounted(() => {
  try {
    editorInstance = new Editor({
      el: editorEl.value,
      height: "250px",
      initialEditType: "markdown",
      previewStyle: "tab",
      initialValue: props.modelValue,
      events: {
        change: () => {
          const markdown = editorInstance.getMarkdown();
          internalValue.value = markdown;
          emit("update:modelValue", markdown);
        },
      },
    });
  } catch (e) {
    fallbackMode.value = true;
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance && editorInstance.getMarkdown && editorInstance.getMarkdown() !== newVal) {
      editorInstance.setMarkdown(newVal || "");
    }
    internalValue.value = newVal;
  }
);

watch(internalValue, (newVal) => {
  if (fallbackMode.value) {
    emit("update:modelValue", newVal);
  }
});

onBeforeUnmount(() => {
  if (editorInstance && editorInstance.destroy) {
    editorInstance.destroy();
  }
});
</script>

