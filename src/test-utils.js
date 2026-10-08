import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { routes as defaultRoutes } from "./router.js";

export function createMockPinia(initialState = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  Object.entries(initialState).forEach(([storeId, state]) => {
    pinia.state.value[storeId] = { ...state };
  });
  return pinia;
}

export function renderWithProviders(component, options = {}) {
  const {
    initialState = {},
    routes = defaultRoutes,
    route = "/",
    props = {},
    slots = {},
    global = {},
    ...mountOptions
  } = options;

  const pinia = createMockPinia(initialState);
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  router.push(route);

  return {
    ...mount(component, {
      props,
      slots,
      global: {
        ...global,
        plugins: [pinia, router, ...(global.plugins || [])],
      },
      ...mountOptions,
    }),
    pinia,
    router,
  };
}

