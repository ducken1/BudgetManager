import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import Dashboard from "../components/Dashboard";

jest.mock("axios"); // Mock axios for API requests

beforeEach(() => {
  jest.clearAllMocks(); // Clear mocks between tests
  localStorage.setItem("token", "test-token"); // Mock token for authorization
});

describe("Dashboard Component", () => {







  test("should delete a budget", async () => {
    axios.delete.mockResolvedValueOnce({ status: 200 });
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);
    fireEvent.click(screen.getByText(/Delete/i));
    expect(axios.delete).toHaveBeenCalled();
  });




  test("should edit a budget", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);

    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.change(screen.getByPlaceholderText(/Budget Name/i), {
      target: { value: "Groceries Updated" },
    });
    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/1",
      { name: "Groceries Updated", amount: 100, type: "necessity" },
      { headers: { Authorization: "Bearer test-token" } }
    );
  });

});
