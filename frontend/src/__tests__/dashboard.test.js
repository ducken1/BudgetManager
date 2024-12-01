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



    test("should add a new budget", async () => {
        axios.post.mockResolvedValueOnce({ status: 201 });
        axios.get.mockResolvedValueOnce({ data: [] }); // Before adding
        axios.get.mockResolvedValueOnce({
          data: [{ _id: "1", name: "New Budget", amount: 200, type: "luxury" }],
        }); // After adding
      
        render(<Dashboard />);
        fireEvent.change(screen.getByPlaceholderText(/Budget Name/i), {
          target: { value: "New Budget" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
          target: { value: "200" },
        });
        fireEvent.change(screen.getByDisplayValue(/necessity/i), {
          target: { value: "luxury" },
        });
        fireEvent.click(screen.getByText(/Add Budget/i));
        
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/budgets/add",
          { name: "New Budget", amount: 200, type: "luxury" },
          { headers: { Authorization: "Bearer test-token" } }
        );
        await screen.findByText(/New Budget/i);
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


  
  test("should display budget category statistics", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: "1", name: "Groceries", amount: 100, type: "necessity" },
        { _id: "2", name: "Entertainment", amount: 50, type: "luxury" },
      ],
    });
  
    render(<Dashboard />);
    await screen.findByText(/necessity: \$100/i);
    await screen.findByText(/luxury: \$50/i);
  });
  

  



});
