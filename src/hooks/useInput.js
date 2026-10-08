import { ref } from "vue";

export function useInput(initialValue = "") {
  const value = ref(initialValue);

  const onChange = (event) => {
    if (event && event.target !== undefined) {
      const target = event.target;
      if (target.type === "checkbox") {
        value.value = target.checked;
      } else {
        value.value = target.value;
      }
    } else {
      value.value = event;
    }
  };

  const setValue = (val) => {
    value.value = val;
  };

  return [value, onChange, setValue];
}

export default useInput;

