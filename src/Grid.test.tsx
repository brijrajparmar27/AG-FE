import { render, screen } from "@testing-library/react";
import Grid from "./Grid";

describe("grid rendered", () => {
  it("should render title", () => {
    render(<Grid />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });
});
