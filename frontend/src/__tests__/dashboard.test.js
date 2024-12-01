import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import Dashboard from "../components/Dashboard";
import '@testing-library/jest-dom';


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
  

  
  test("should alert when entering an invalid limit", async () => {
    // Mock the alert function
    jest.spyOn(window, "alert").mockImplementation(() => {});
  
    // Simulate entering an invalid limit (e.g., a negative value or zero)
    render(<Dashboard />);
    fireEvent.change(screen.getByPlaceholderText(/Set your limit/i), {
      target: { value: "-10" },
    });
    fireEvent.click(screen.getByText(/Set Limit/i));
  
    // Check that alert was called with the correct message
    expect(window.alert).toHaveBeenCalledWith("Please enter a valid positive limit.");
  
    // Restore the alert function
    window.alert.mockRestore();
  });
  
  test("should update budget amount correctly after editing", async () => {
    // Mock the axios get and put
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    axios.put.mockResolvedValueOnce({ status: 200 });
  
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);
  
    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByText(/Save Changes/i));
  
    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/1",
      { name: "Groceries", amount: 150, type: "necessity" },
      { headers: { Authorization: "Bearer test-token" } }
    );
  });
  
  test("should call the correct API when deleting a budget", async () => {
    // Mock the axios get and delete
    axios.get.mockResolvedValueOnce({
      data: [{ _id: "1", name: "Groceries", amount: 100, type: "necessity" }],
    });
    axios.delete.mockResolvedValueOnce({ status: 200 });
  
    render(<Dashboard />);
    await screen.findByText(/Groceries/i);
  
    fireEvent.click(screen.getByText(/Delete/i));
  
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/1",
      { headers: { Authorization: "Bearer test-token" } }
    );
  });
  
  test("should set the budget limit correctly after form submission", async () => {
    // Mock the axios post
    axios.post.mockResolvedValueOnce({ status: 200 });
    axios.get.mockResolvedValueOnce({ data: { limit: 1000 } });
  
    render(<Dashboard />);
    
    fireEvent.change(screen.getByPlaceholderText(/Set your limit/i), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByText(/Set Limit/i));
  
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/budgets/setLimit",
      { limit: 500 },
      { headers: { Authorization: "Bearer test-token" } }
    );
  });
  

  test("should show alert when budget exceeds limit", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: "1", name: "Groceries", amount: 500, type: "necessity" },
        { _id: "2", name: "Entertainment", amount: 600, type: "luxury" },
      ],
    });
    axios.get.mockResolvedValueOnce({ data: { limit: 1000 } }); // Set limit to 1000
    
    render(<Dashboard />);
  
    await screen.findByText(/necessity: \$500/i);
    await screen.findByText(/luxury: \$600/i);
    
    // Check that the limit is set correctly and the alert appears
    expect(screen.getByText(/Your Limit: \$1000/)).toBeInTheDocument();
    expect(screen.getByText(/Alert: You have exceeded your budget limit!/)).toBeInTheDocument();
  });
  

  test("should render the Add Budget form with correct fields", () => {
    render(<Dashboard />);
  
    // Check if the form elements are present
    expect(screen.getByPlaceholderText(/Budget Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/necessity/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Budget/i)).toBeInTheDocument();
  
    // Ensure the default option for the category is "necessity"
    const categorySelect = screen.getByDisplayValue(/necessity/i);
    expect(categorySelect.tagName).toBe("SELECT");
    expect(categorySelect).toHaveValue("necessity");
  });
  
  
  
});
