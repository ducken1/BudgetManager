import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/budgets')
      .then(response => {
        setBudgets(response.data);
      })
      .catch(error => {
        console.error('Error fetching budgets', error);
      });
  }, []);

  return (
    <div>
      <h2>Your Budgets</h2>
      <ul>
        {budgets.map(budget => (
          <li key={budget.id}>{budget.name}: ${budget.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
