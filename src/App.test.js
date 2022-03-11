import { render, screen } from '@testing-library/react';
import AppController from './dom/AppController';

test('renders learn react link', () => {
  render(<AppController />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
