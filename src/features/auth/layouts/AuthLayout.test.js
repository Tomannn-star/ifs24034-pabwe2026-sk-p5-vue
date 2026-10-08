import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("should render correctly", () => {
    const wrapper = mount(AuthLayout, {
      global: {
        stubs: ["RouterView"],
      },
    });
    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("Lelang Online Terpercaya");
  });
});

