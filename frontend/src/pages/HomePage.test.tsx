import { screen } from "@testing-library/react";
import { HomePage } from "./HomePage";
import { renderPage } from "../test/render";

describe("HomePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ status: "ok", service: "rawi-api" }),
      })),
    );
  });

  it("presents the project without a medical claim", async () => {
    renderPage(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/récits/i);
    expect(await screen.findByText(/validation médicale/i)).toBeInTheDocument();
    expect(screen.queryByText(/\/\s*100/)).not.toBeInTheDocument();
  });
});
