import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import PowerTimers from "."

describe("PowerTimers", () => {
  beforeEach(() => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PowerTimers />
      </QueryClientProvider>,
    )
  })

  it("Renders submit button", () => {
    const button = screen.getByRole("button", { name: /save timers/i })
    expect(button).toBeInTheDocument()
  })

  it("Runs validation on submit", async () => {
    fireEvent.change(screen.getAllByLabelText(/power off/i)[0], { target: { value: "" } })

    fireEvent.click(screen.getByTestId("submit-button"))
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
    })
  })

  it("Adds a new timer row", async () => {
    fireEvent.click(screen.getByTestId("add-timer-button"))
    await waitFor(() => {
      expect(screen.getAllByLabelText(/power off/i).length).toBe(2)
      expect(screen.getByText(/you can add 5 more timers/i)).toBeInTheDocument()
    })
  })
})
