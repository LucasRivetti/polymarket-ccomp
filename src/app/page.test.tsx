import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Página inicial", () => {
  it("mostra o nome do projeto", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Polymarket CCOMP" })).toBeInTheDocument();
  });
});
