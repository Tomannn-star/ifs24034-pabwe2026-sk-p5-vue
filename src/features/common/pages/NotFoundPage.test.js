import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("should render 404 message and return link", () => {
    const wrapper = mount(NotFoundPage, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    expect(wrapper.text()).toContain("Kembali ke Beranda");
  });
});
