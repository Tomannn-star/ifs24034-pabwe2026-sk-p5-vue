import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SidebarComponent from "./SidebarComponent.vue";

describe("SidebarComponent", () => {
  const customStubs = {
    RouterLink: {
      template: "<a @click=\"$emit('click')\"><slot /></a>",
    },
  };

  it("should render links and respond to close events", async () => {
    const wrapper = mount(SidebarComponent, {
      props: { isOpen: true },
      global: { stubs: customStubs },
    });

    expect(wrapper.text()).toContain("Semua Lelang");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");

    await wrapper.find("[data-testid='backdrop']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find("button[aria-label='Close Sidebar']").trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);

    const links = wrapper.findAll("a");
    for (const link of links) {
      await link.trigger("click");
    }
    expect(wrapper.emitted("close").length).toBeGreaterThanOrEqual(5);
  });

  it("should not show backdrop when isOpen is false", () => {
    const wrapper = mount(SidebarComponent, {
      props: { isOpen: false },
      global: { stubs: customStubs },
    });

    expect(wrapper.find("[data-testid='backdrop']").exists()).toBe(false);
  });
});
