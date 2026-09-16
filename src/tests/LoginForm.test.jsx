import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../redux/slices/uiSlice';
import { AuthProvider } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

function renderWithProviders(initialUiState = { authModal: { isOpen: true, mode: 'login' } }) {
  const testStore = configureStore({
    reducer: {
      ui: uiReducer,
    },
    preloadedState: {
      ui: initialUiState,
    },
  });

  return render(
    <Provider store={testStore}>
      <AuthProvider>
        <AuthModal />
      </AuthProvider>
    </Provider>
  );
}

describe('AuthModal & LoginForm', () => {
  it('renders login form with email and password inputs when open', () => {
    renderWithProviders();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sign In' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Demo User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo Admin/i })).toBeInTheDocument();
  });

  it('switches to registration mode when Create Account button is clicked', () => {
    renderWithProviders();

    const createAccountTab = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(createAccountTab);

    expect(screen.getByText('Join Ciniverse')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Elena Rostova')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', () => {
    renderWithProviders();

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@Ciniverse.app' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword123' } });

    expect(emailInput.value).toBe('test@Ciniverse.app');
    expect(passwordInput.value).toBe('SecretPassword123');
  });
});
