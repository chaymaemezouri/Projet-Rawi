import { render, screen } from "@testing-library/react";
import { ModuleStatusPanel } from "./ModuleStatusPanel";

describe("ModuleStatusPanel", () => {
  it("does not present a confidence score", () => {
    render(
      <ModuleStatusPanel
        status="not_implemented"
        message="Aucun indicateur de confiance n'est produit."
        disclaimer="Un futur indicateur ne constituera jamais une validation médicale."
      />,
    );
    expect(screen.getByTestId("module-status")).toHaveTextContent("not_implemented");
    expect(screen.getByText(/validation médicale/i)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
  });
});
