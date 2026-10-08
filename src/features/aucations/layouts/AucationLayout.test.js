import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AucationLayout from "./AucationLayout.vue";

describe("AucationLayout", () => {
  it("should render navbar, sidebar, and content shell", async () => {
    const wrapper = mount(AucationLayout, {
      global: {
        stubs: {
          NavbarComponent: {
            template: "<button @click=\"$emit('toggle-sidebar')\" data-testid='toggle'></button>",
          },
          SidebarComponent: {
            template: "<button @click=\"$emit('close')\" data-testid='close-sidebar'></button>",
            props: ["isOpen"],
          },
          RouterView: { template: "<div data-testid='view'></div>" },
        },
      },
    });

    expect(wrapper.find("[data-testid='view']").exists()).toBe(true);
    await wrapper.find("[data-testid='toggle']").trigger("click");
    expect(wrapper.vm.sidebarOpen).toBe(true);

    await wrapper.find("[data-testid='close-sidebar']").trigger("click");
    expect(wrapper.vm.sidebarOpen).toBe(false);
  });
});
