import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddCandidateForm from '../../components/AddCandidateForm';

// Mock de fetch global
global.fetch = jest.fn();

describe('AddCandidateForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  const renderForm = () => {
    return render(
      <BrowserRouter>
        <AddCandidateForm />
      </BrowserRouter>
    );
  };

  describe('Complete form submission flow', () => {
    it('should submit complete candidate data with all fields', async () => {
      // Mock successful CV upload
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ filePath: 'uploads/test-cv.pdf', fileType: 'application/pdf' }),
      });

      // Mock successful candidate creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Candidate added successfully',
          data: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        }),
      });

      renderForm();

      // Fill basic information
      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const phoneInput = screen.getByLabelText(/teléfono/i);
      const addressInput = screen.getByLabelText(/dirección/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '612345678' } });
      fireEvent.change(addressInput, { target: { value: '123 Main St' } });

      // Add education
      const addEducationButton = screen.getByText(/añadir educación/i);
      fireEvent.click(addEducationButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/institución/i)).toBeInTheDocument();
      });

      const institutionInput = screen.getByLabelText(/institución/i);
      const titleInput = screen.getByLabelText(/título/i);
      fireEvent.change(institutionInput, { target: { value: 'Test University' } });
      fireEvent.change(titleInput, { target: { value: 'Computer Science' } });

      // Add work experience
      const addWorkButton = screen.getByText(/añadir experiencia/i);
      fireEvent.click(addWorkButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
      });

      const companyInput = screen.getByLabelText(/empresa/i);
      const positionInput = screen.getByLabelText(/puesto/i);
      fireEvent.change(companyInput, { target: { value: 'Test Company' } });
      fireEvent.change(positionInput, { target: { value: 'Developer' } });

      // Upload CV using FileUploader mock
      const fileInput = screen.getByTestId('mock-file-input');
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Click upload button
      const uploadButton = screen.getByTestId('mock-upload-button');
      fireEvent.click(uploadButton);

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Verify fetch was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // One for upload, one for submit
        const submitCall = global.fetch.mock.calls.find(
          call => call[0] === 'http://localhost:3010/candidates'
        );
        expect(submitCall).toBeDefined();
        const submitBody = JSON.parse(submitCall[1].body);
        expect(submitBody).toMatchObject({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '612345678',
          address: '123 Main St',
        });
        expect(submitBody.educations).toBeDefined();
        expect(submitBody.workExperiences).toBeDefined();
        expect(submitBody.cv).toMatchObject({
          filePath: 'uploads/test-cv.pdf',
          fileType: 'application/pdf',
        });
      }, { timeout: 5000 });
    });

    it('should handle form submission failure', async () => {
      // Mock successful CV upload
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ filePath: 'uploads/test-cv.pdf', fileType: 'application/pdf' }),
      });

      // Mock failed candidate creation
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Error adding candidate',
          error: 'Failed to create candidate',
        }),
      });

      renderForm();

      // Fill form
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'john.doe@example.com' } });

      // Upload CV
      const fileInput = screen.getByTestId('mock-file-input');
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const uploadButton = screen.getByTestId('mock-upload-button');
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Dynamic sections integration', () => {
    it('should add and remove multiple education entries', async () => {
      renderForm();

      // Add first education
      const addEducationButton = screen.getByText(/añadir educación/i);
      fireEvent.click(addEducationButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/institución/i)).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByLabelText(/institución/i), { target: { value: 'University 1' } });

      // Add second education
      fireEvent.click(addEducationButton);
      
      await waitFor(() => {
        expect(screen.getAllByLabelText(/institución/i).length).toBe(2);
      });
      
      const institutionInputs = screen.getAllByLabelText(/institución/i);
      fireEvent.change(institutionInputs[1], { target: { value: 'University 2' } });

      // Verify both are present
      expect(institutionInputs).toHaveLength(2);
      expect(screen.getByDisplayValue('University 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('University 2')).toBeInTheDocument();

      // Remove first education
      const removeButtons = screen.getAllByText(/eliminar/i);
      fireEvent.click(removeButtons[0]);

      // Verify first is removed
      await waitFor(() => {
        expect(screen.queryByDisplayValue('University 1')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('University 2')).toBeInTheDocument();
      });
    });

    it('should add and remove multiple work experience entries', async () => {
      renderForm();

      // Add first work experience
      const addWorkButton = screen.getByText(/añadir experiencia/i);
      fireEvent.click(addWorkButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByLabelText(/empresa/i), { target: { value: 'Company 1' } });

      // Add second work experience
      fireEvent.click(addWorkButton);
      
      await waitFor(() => {
        expect(screen.getAllByLabelText(/empresa/i).length).toBe(2);
      });
      
      const companyInputs = screen.getAllByLabelText(/empresa/i);
      fireEvent.change(companyInputs[1], { target: { value: 'Company 2' } });

      // Verify both are present
      expect(companyInputs).toHaveLength(2);
      expect(screen.getByDisplayValue('Company 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Company 2')).toBeInTheDocument();

      // Remove first work experience
      const removeButtons = screen.getAllByText(/eliminar/i);
      fireEvent.click(removeButtons[0]);

      // Verify first is removed
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Company 1')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('Company 2')).toBeInTheDocument();
      });
    });
  });

  describe('Form validation integration', () => {
    it('should validate required fields before submission', async () => {
      renderForm();

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Verify fetch was not called (form validation prevents submission)
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });
});
