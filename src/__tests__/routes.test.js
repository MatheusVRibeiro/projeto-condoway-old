import React from 'react';
import { render } from '@testing-library/react-native';
import Routes from '../routes';
import { AuthProvider } from '../contexts/AuthContext';

describe('Routes', () => {
  it('renderiza rotas de autenticação quando não logado', () => {
    const { getByText } = render(
      <AuthProvider>
        <Routes />
      </AuthProvider>
    );
    expect(getByText(/login/i)).toBeTruthy();
  });
});
