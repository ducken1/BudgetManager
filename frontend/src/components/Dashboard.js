// components/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("necessity"); // Default type

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    try {
      const response = await axios.get("http://localhost:5000/budgets", {
        headers: { Authorization: `Bearer ${token}` }, // Include token in request headers
      });
      console.log("Fetched Budgets:", response.data);
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets", error);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to add a budget.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/budgets/add",
        {
          name,
          amount: Number(amount),
          type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        fetchBudgets();
        setName("");
        setAmount("");
        setType("necessity");
      }
    } catch (error) {
      console.error(
        "Error adding budget:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Error adding budget: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  return (
    <div>
      <h2>Your Budgets</h2>
      <ul>
        {budgets.map((budget) => (
          <li key={budget._id}>
            {budget.name}: ${budget.amount} ({budget.type})
          </li>
        ))}
      </ul>

      <h3>Add a New Budget</h3>
      <form onSubmit={handleAddBudget}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Budget Name"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="necessity">Necessity</option>
          <option value="luxury">Luxury</option>
          <option value="bills">Bills</option>
          <option value="profit">Profit</option>
        </select>
        <button type="submit">Add Budget</button>
      </form>
    </div>
  );
};

export default Dashboard;
