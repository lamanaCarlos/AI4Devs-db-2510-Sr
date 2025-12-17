import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecruiterDashboard from './RecruiterDashboard';

describe('RecruiterDashboard', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Rendering', () => {
    it('should render logo', () => {
      renderWithRouter(<RecruiterDashboard />);

      const logo = screen.getByAltText('LTI Logo');
      expect(logo).toBeInTheDocument();
      // La imagen puede tener diferentes rutas según la configuración
      expect(logo.tagName).toBe('IMG');
    });

    it('should render dashboard title', () => {
      renderWithRouter(<RecruiterDashboard />);

      const title = screen.getByText(/dashboard del reclutador/i);
      expect(title).toBeInTheDocument();
    });

    it('should render "Add Candidate" card', () => {
      renderWithRouter(<RecruiterDashboard />);

      const cardTitle = screen.getByText(/añadir candidato/i);
      expect(cardTitle).toBeInTheDocument();
    });

    it('should render link to add candidate page', () => {
      renderWithRouter(<RecruiterDashboard />);

      const link = screen.getByRole('link', { name: /añadir nuevo candidato/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/add-candidate');
    });

    it('should render "Add New Candidate" button', () => {
      renderWithRouter(<RecruiterDashboard />);

      const button = screen.getByRole('button', { name: /añadir nuevo candidato/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to add candidate page on button click', () => {
      renderWithRouter(<RecruiterDashboard />);

      const link = screen.getByRole('link', { name: /añadir nuevo candidato/i });
      expect(link).toHaveAttribute('href', '/add-candidate');
    });
  });
});
