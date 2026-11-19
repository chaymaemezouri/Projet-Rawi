import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ConfirmRoot, confirmAction } from "../components/ui/Confirm";
import i18n from "./index";

afterEach(async () => {
  localStorage.setItem("rawi_lang", "fr");
  await i18n.changeLanguage("fr");
  document.body.dataset.confirmed = "";
});

describe("language", () => {
  it("keeps French, Arabic and Darija and the reading direction", async () => {
    render(<LanguageSwitcher />);
    const arabic = screen.getByRole("button", { name: "العربية" });
    arabic.focus();
    expect(arabic).toHaveFocus();
    fireEvent.click(arabic);
    expect(i18n.language).toBe("ar");
    expect(localStorage.getItem("rawi_lang")).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");

    fireEvent.click(screen.getByRole("button", { name: "الدارجة" }));
    expect(i18n.language).toBe("ary");
    expect(localStorage.getItem("rawi_lang")).toBe("ary");
    expect(document.documentElement.dir).toBe("rtl");

    fireEvent.click(screen.getByRole("button", { name: "Français" }));
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("fr");
  });
});

describe("confirm dialog", () => {
  it("is reachable from the keyboard and closes with Escape", async () => {
    await i18n.changeLanguage("fr");
    render(
      <>
        <ConfirmRoot />
        <button
          type="button"
          onClick={() => {
            void confirmAction("Supprimer ce récit ?").then((accepted) => {
              document.body.dataset.confirmed = String(accepted);
            });
          }}
        >
          Demander
        </button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Demander" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Supprimer ce récit ?");
    expect(screen.getByRole("button", { name: "Annuler" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(document.body.dataset.confirmed).toBe("false"));
  });
});
