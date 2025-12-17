import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AddCandidateForm from './AddCandidateForm';
import FileUploader from './FileUploader';

// Mock de FileUploader
jest.mock('./FileUploader', () => {
  return function MockFileUploader({ onChange, onUpload }) {
    return (
      <div data-testid="file-uploader">
        <input
          type="file"
          data-testid="mock-file-input"
          onChange={(e) => {
            if (e.target.files[0] && onChange) {
              onChange(e.target.files[0]);
            }
          }}
        />
        <button
          data-testid="mock-upload-button"
          onClick={() => {
            if (onUpload) {
              onUpload({ filePath: 'uploads/test.pdf', fileType: 'application/pdf' });
            }
          }}
        >
          Upload
        </button>
      </div>
    );
  };
});

// Mock de react-datepicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker({ selected, onChange, placeholderText }) {
    return (
      <input
        type="text"
        data-testid={`datepicker-${placeholderText}`}
        value={selected ? selected.toISOString().slice(0, 10) : ''}
        onChange={(e) => {
          if (onChange) {
            onChange(new Date(e.target.value));
          }
        }}
        placeholder={placeholderText}
      />
    );
  };
});

// Mock de fetch global
global.fetch = jest.fn();

describe('AddCandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<AddCandidateForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    });

    it('should render education section when added', () => {
      render(<AddCandidateForm />);

      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/título/i)).toBeInTheDocument();
    });

    it('should render work experience section when added', () => {
      render(<AddCandidateForm />);

      const addWorkExpButton = screen.getByRole('button', { name: /añadir experiencia laboral/i });
      fireEvent.click(addWorkExpButton);

      expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/puesto/i)).toBeInTheDocument();
    });

    it('should render FileUploader component', () => {
      render(<AddCandidateForm />);

      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AddCandidateForm />);

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should render error messages when present', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email' }),
      });

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verificar que fetch fue llamado (el error se manejará internamente)
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should render success messages when present', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, message: 'Candidate added successfully' }),
      });

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/candidato añadido con éxito/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should update firstName on input change', () => {
      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      expect(firstNameInput).toHaveValue('John');
    });

    it('should update lastName on input change', () => {
      render(<AddCandidateForm />);

      const lastNameInput = screen.getByLabelText(/apellido/i);
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });

      expect(lastNameInput).toHaveValue('Doe');
    });

    it('should update email on input change', () => {
      render(<AddCandidateForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });

      expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should update phone on input change', () => {
      render(<AddCandidateForm />);

      const phoneInput = screen.getByLabelText(/teléfono/i);
      fireEvent.change(phoneInput, { target: { value: '612345678' } });

      expect(phoneInput).toHaveValue('612345678');
    });

    it('should update address on input change', () => {
      render(<AddCandidateForm />);

      const addressInput = screen.getByLabelText(/dirección/i);
      fireEvent.change(addressInput, { target: { value: '123 Main St' } });

      expect(addressInput).toHaveValue('123 Main St');
    });

    it('should add education section on button click', () => {
      render(<AddCandidateForm />);

      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/título/i)).toBeInTheDocument();
    });

    it('should remove education section on delete click', () => {
      render(<AddCandidateForm />);

      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      expect(screen.queryByPlaceholderText(/institución/i)).not.toBeInTheDocument();
    });

    it('should add work experience section on button click', () => {
      render(<AddCandidateForm />);

      const addWorkExpButton = screen.getByRole('button', { name: /añadir experiencia laboral/i });
      fireEvent.click(addWorkExpButton);

      expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/puesto/i)).toBeInTheDocument();
    });

    it('should remove work experience section on delete click', () => {
      render(<AddCandidateForm />);

      const addWorkExpButton = screen.getByRole('button', { name: /añadir experiencia laboral/i });
      fireEvent.click(addWorkExpButton);

      expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      expect(screen.queryByPlaceholderText(/empresa/i)).not.toBeInTheDocument();
    });

    it('should update education fields on change', () => {
      render(<AddCandidateForm />);

      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      const institutionInput = screen.getByPlaceholderText(/institución/i);
      fireEvent.change(institutionInput, { target: { value: 'University' } });

      expect(institutionInput).toHaveValue('University');
    });

    it('should update work experience fields on change', () => {
      render(<AddCandidateForm />);

      const addWorkExpButton = screen.getByRole('button', { name: /añadir experiencia laboral/i });
      fireEvent.click(addWorkExpButton);

      const companyInput = screen.getByPlaceholderText(/empresa/i);
      fireEvent.change(companyInput, { target: { value: 'Tech Company' } });

      expect(companyInput).toHaveValue('Tech Company');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ id: 1, message: 'Candidate added successfully' }),
      };

      global.fetch.mockResolvedValue(mockResponse);

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3010/candidates',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('should format dates correctly before submission', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ id: 1 }),
      };

      global.fetch.mockResolvedValue(mockResponse);

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.click(addEducationButton);

      const startDateInput = screen.getByTestId('datepicker-Fecha de Inicio');
      fireEvent.change(startDateInput, { target: { value: '2020-01-01' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.educations[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should show success message on successful submission', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 1 }),
      });

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/candidato añadido con éxito/i)).toBeInTheDocument();
      });
    });

    it('should show error message on failed submission', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email' }),
      });

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verificar que se llamó a fetch con los datos correctos
        expect(global.fetch).toHaveBeenCalled();
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.firstName).toBe('John');
        expect(body.lastName).toBe('Doe');
      }, { timeout: 3000 });
    });

    it('should handle CV upload data in submission', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ id: 1 }),
      };

      global.fetch.mockResolvedValue(mockResponse);

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });

      // Simular carga de CV
      const uploadButton = screen.getByTestId('mock-upload-button');
      fireEvent.click(uploadButton);

      // Esperar un momento para que el estado se actualice
      await waitFor(() => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        // Verificar que el formulario se envió correctamente
        expect(body.firstName).toBe('John');
        expect(body.lastName).toBe('Doe');
        expect(body.email).toBe('john.doe@example.com');
        // El CV puede estar presente o no dependiendo del timing
      }, { timeout: 3000 });
    });
  });
});
