import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AuraVue navigation and brand logo', async () => {
  render(<App />);
  const brandElements = await screen.findAllByText(/Aura/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

