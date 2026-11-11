import { fireEvent, screen } from "@testing-library/react";
import { StoryFormPage } from "./StoryFormPage";
import { renderPage } from "../test/render";

describe("StoryFormPage", () => {
  it("blocks a story when consent is missing", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/categories")) {
        return { ok: true, status: 200, json: async () => [] };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPage(<StoryFormPage />);
    fireEvent.submit(await screen.findByRole("form", { name: "Déposer un récit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/consentement/i);
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("/api/stories"))).toBe(false);
  });
});
