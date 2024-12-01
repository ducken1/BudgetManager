import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import axios from 'axios';
import '@testing-library/jest-dom';
import mockAxios from 'axios-mock-adapter';

// Create a mock instance of Axios
const mock = new mockAxios(axios);

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    mock.reset();
  });

  it('should display the total amount and limit', async () => {
    mock.onGet('http://localhost:3000/budgets').reply(200, [
      { amount: 100 },
      { amount: 200 },
    ]);
    mock.onGet('http://localhost:3000/budgets/getLimit').reply(200, { limit: 500 });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Money: $300')).toBeInTheDocument();
    });
  });

  it('should display a warning if the total money is below the limit', async () => {
    mock.onGet('http://localhost:3000/budgets').reply(200, [
      { amount: 100 },
      { amount: 200 },
    ]);
    mock.onGet('http://localhost:3000/budgets/getLimit').reply(200, { limit: 500 });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Warning: Your total money is below the set limit!')).toBeInTheDocument();
    });
  });

  it('should add a new budget', async () => {
    mock.onPost('http://localhost:3000/budgets/add').reply(201, { message: 'Budget added successfully' });
    mock.onGet('http://localhost:3000/budgets').reply(200, [{ name: 'Test Budget', amount: 100 }]);

    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText('Budget Name'), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Add Budget'));

    await waitFor(() => {
      expect(screen.getByText('Groceries: $100')).toBeInTheDocument();
    });
  });

  it('should delete a budget', async () => {
    mock.onDelete('http://localhost:3000/budgets/1').reply(200, { message: 'Budget deleted successfully' });
    mock.onGet('http://localhost:3000/budgets').reply(200, [{ _id: 1, name: 'Test Budget', amount: 100 }]);

    render(<Dashboard />);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Test Budget')).not.toBeInTheDocument();
    });
  });

  it('should edit a budget', async () => {
    mock.onPut('http://localhost:3000/budgets/1').reply(200, { name: 'Updated Budget', amount: 150 });
    mock.onGet('http://localhost:3000/budgets').reply(200, [{ _id: 1, name: 'Test Budget', amount: 100 }]);

    render(<Dashboard />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByPlaceholderText('Budget Name'), { target: { value: 'Updated Budget' } });
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '150' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Updated Budget: $150')).toBeInTheDocument();
    });
  });

  it('should set a budget limit', async () => {
    mock.onPost('http://localhost:3000/budgets/setLimit').reply(200, { message: 'Limit set successfully' });

    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText('Set your limit'), { target: { value: '500' } });
    fireEvent.click(screen.getByText('Set Limit'));

    await waitFor(() => {
      expect(screen.getByText('Limit set to $500')).toBeInTheDocument();
    });
  });

  it('should show an error message if setting an invalid limit', async () => {
    render(<Dashboard />);

    fireEvent.change(screen.getByPlaceholderText('Set your limit'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Set Limit'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive limit.')).toBeInTheDocument();
    });
  });

  it('should display the correct budget categories', async () => {
    mock.onGet('http://localhost:3000/budgets').reply(200, [
      { name: 'Groceries', amount: 100, type: 'necessity' },
      { name: 'Entertainment', amount: 50, type: 'luxury' },
    ]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('necessity: $100')).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching budgets', async () => {
    mock.onGet('http://localhost:3000/budgets').reply(500);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching budgets')).toBeInTheDocument();
    });
  });
});
