import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css"; // Uvoz CSS datoteke

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("necessity");
  const [totalMoney, setTotalMoney] = useState(0);
  const [limit, setLimit] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  const [limitNotification, setLimitNotification] = useState(false);
  const [overLimit, setOverLimit] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState(null);

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

    if (limit !== null && totalMoney > limit) {
      setOverLimit(true);
    } else {
      setOverLimit(false);
    }
  }, [totalMoney, limit]);

  const fetchBudgets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3000/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(response.data);

      const total = response.data.reduce((sum, budget) => sum + budget.amount, 0);
      setTotalMoney(total);

      const categoryData = {};
      response.data.forEach((budget) => {
        if (categoryData[budget.type]) {
          categoryData[budget.type] += budget.amount;
        } else {
          categoryData[budget.type] = budget.amount;
        }
      });
      setCategoryStats(categoryData);
    } catch (error) {
      console.error("Error fetching budgets", error);
    }
  };

  const fetchUserLimit = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3000/budgets/getLimit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.limit !== undefined) {
        setLimit(response.data.limit);
      } else {
        setLimit(null);
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
        "http://localhost:3000/budgets/add",
        { name, amount: Number(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        fetchBudgets();
        setName("");
        setAmount("");
        setType("necessity");
      }
    } catch (error) {
      console.error("Error adding budget:", error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.delete(`http://localhost:3000/budgets/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Delete response:", response.data);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error.response ? error.response.data : error.message);
    }
  };

  const handleEditBudget = (budget) => {
    setEditMode(true);
    setEditBudgetId(budget._id);
    setName(budget.name);
    setAmount(budget.amount);
    setType(budget.type);
  };

  const handleSaveEditBudget = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://localhost:3000/budgets/${editBudgetId}`,
        { name, amount: Number(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Update response:", response.data);
      fetchBudgets();
      setEditMode(false);
      setName("");
      setAmount("");
      setType("necessity");
      setEditBudgetId(null);
    } catch (error) {
      console.error("Error updating budget:", error.response ? error.response.data : error.message);
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
        const response = await axios.post(
            "http://localhost:3000/budgets/setLimit",
            { limit: parsedLimit },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Limit set response:", response.data);
        alert(`Limit set to $${parsedLimit}`);
        fetchUserLimit();
        setNewLimit("");
    } catch (error) {
        console.error("Error setting limit:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Your Budgets</h2>
      <h3>Total Money: ${totalMoney}</h3>
      <h3>Your Limit: ${limit !== null ? limit : "Not Set"}</h3>

      {limitNotification && (
        <div className="warning">
          Warning: Your total money is below the set limit!
        </div>
      )}

      {overLimit && (
        <div className="alert">
          Alert: You have exceeded your budget limit!
        </div>
      )}

      <h3>Statistika Porabe po Kategorijah:</h3>
      <ul>
        {Object.entries(categoryStats).map(([category, amount]) => (
          <li key={category}>
            {category}: ${amount}
          </li>
        ))}
      </ul>

      <ul>
        {budgets.map((budget) => (
          <li key={budget._id} className="budget-item">
            <span className="budget-item-text">
              {budget.name}: ${budget.amount} ({budget.type})
            </span>
            <div className="button-group">
              <button className="edit" onClick={() => handleEditBudget(budget)}>Edit</button>
              <button className="delete" onClick={() => handleDeleteBudget(budget._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="form-section">
        <h3>{editMode ? "Edit Budget" : "Add a New Budget"}</h3>
        <form onSubmit={editMode ? handleSaveEditBudget : handleAddBudget}>
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
          <button className="submit" type="submit">{editMode ? "Save Changes" : "Add Budget"}</button>
          {editMode && <button className="cancel" onClick={() => setEditMode(false)}>Cancel</button>}
        </form>
      </div>

      <div className="form-section">
        <h3>Set a Limit</h3>
        <form onSubmit={handleSetLimit}>
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            placeholder="Set your limit"
            required
          />
          <button className="submit" type="submit">Set Limit</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
