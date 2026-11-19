import axe from "axe-core";
import { LoginPage } from "./AuthPages";
import { renderPage } from "../test/render";

describe("LoginPage accessibility", () => {
  it("has no serious axe-core violations in jsdom", async () => {
    const { container } = renderPage(<LoginPage />);
    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
      },
    });
    const serious = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
    expect(serious.map((item) => item.id)).toEqual([]);
  });
});
