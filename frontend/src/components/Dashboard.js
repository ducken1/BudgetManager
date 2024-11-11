import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("necessity");
  const [totalMoney, setTotalMoney] = useState(0);
  const [limit, setLimit] = useState(null); // Actual limit fetched from the backend
  const [newLimit, setNewLimit] = useState(""); // For user input when setting limit
  const [limitNotification, setLimitNotification] = useState(false);

  useEffect(() => {
    fetchBudgets();
    fetchUserLimit();
  }, []);

  useEffect(() => {
    if (limit !== null && totalMoney < limit) {
      setLimitNotification(true);
    } else {
      setLimitNotification(false);
    }
  }, [totalMoney, limit]);

  const fetchBudgets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:5000/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(response.data);

      const total = response.data.reduce((sum, budget) => sum + budget.amount, 0);
      setTotalMoney(total);
    } catch (error) {
      console.error("Error fetching budgets", error);
    }
  };

  const fetchUserLimit = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:5000/budgets/getLimit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.limit !== undefined) {
        setLimit(response.data.limit); // Set limit from MongoDB
      } else {
        setLimit(null); // No limit set in the database
      }
    } catch (error) {
      console.error("Error fetching limit:", error);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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
    }
  };

  const handleSetLimit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const parsedLimit = Number(newLimit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      alert("Please enter a valid positive limit.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/budgets/setLimit",
        { limit: parsedLimit },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Limit set to $${parsedLimit}`);
      fetchUserLimit(); // Refresh the limit from backend
      setNewLimit(""); // Clear input
    } catch (error) {
      console.error("Error setting limit:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h2>Your Budgets</h2>

      {/* Display total money */}
      <h3>Total Money: ${totalMoney}</h3>

      {/* Display the user's limit from MongoDB */}
      <h3>Your Limit: ${limit !== null ? limit : "Not Set"}</h3>

      {/* Notification when totalMoney is below the limit */}
      {limitNotification && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          Warning: Your total money is below the set limit!
        </div>
      )}

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

      <h3>Set a Limit</h3>
      <form onSubmit={handleSetLimit}>
        <input
          type="number"
          value={newLimit}
          onChange={(e) => setNewLimit(e.target.value)}
          placeholder="Set your limit"
          required
        />
        <button type="submit">Set Limit</button>
      </form>
    </div>
  );
};

export default Dashboard;
