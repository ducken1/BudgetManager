import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import Dashboard from "../Dashboard";

jest.mock("axios"); // Mock axios for API requests

beforeEach(() => {
  jest.clearAllMocks(); // Clear mocks between tests
  localStorage.setItem("token", "test-token"); // Mock token for authorization
});

describe("Dashboard Component", () => {
  test("should render the Dashboard component", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Dashboard />);
    expect(await screen.findByText(/Your Budgets/i)).toBeInTheDocument();
  });

  test("should fetch and display budgets", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    render(<Dashboard />);
    expect(await screen.findByText(/Groceries: \$100/i)).toBeInTheDocument();
  });

  test("should add a new budget", async () => {
    axios.post.mockResolvedValueOnce({ status: 201 });
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Budget Name/i), {
      target: { value: "Groceries" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText(/Add Budget/i));

    expect(await screen.findByText(/Groceries: \$100/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/add",
      { name: "Groceries", amount: 100, type: "necessity" },
      { headers: { Authorization: "Bearer test-token" } }
    );
  });

  test("should display error message if add budget fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Failed to add budget"));
    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Budget Name/i), {
      target: { value: "Groceries" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText(/Add Budget/i));

    expect(await screen.findByText(/Error adding budget:/i)).toBeInTheDocument();
  });

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

  test("should set a budget limit", async () => {
    axios.post.mockResolvedValueOnce({ data: { limit: 1000 } });
    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Set your limit/i), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByText(/Set Limit/i));

    expect(await screen.findByText(/Limit set to: \$1000/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/setLimit",
      { limit: 1000 },
      { headers: { Authorization: "Bearer test-token" } }
    );
  });

  test("should display warning when total money is below limit", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);

    fireEvent.change(screen.getByPlaceholderText(/Set your limit/i), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByText(/Set Limit/i));
    expect(await screen.findByText(/Warning: Your total money is below/i)).toBeInTheDocument();
  });

  test("should display alert when over budget limit", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 150, type: "necessity" }],
    });
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);

    fireEvent.change(screen.getByPlaceholderText(/Set your limit/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText(/Set Limit/i));
    expect(await screen.findByText(/Alert: You have exceeded your budget limit/i)).toBeInTheDocument();
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

  test("should cancel edit mode", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);

    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.click(screen.getByText(/Cancel/i));

    expect(await screen.findByText(/Add a New Budget/i)).toBeInTheDocument();
  });
});
