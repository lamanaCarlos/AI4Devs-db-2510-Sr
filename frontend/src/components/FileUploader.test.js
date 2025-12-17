import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploader from './FileUploader';

// Mock de fetch global
global.fetch = jest.fn();

describe('FileUploader', () => {
  const mockOnChange = jest.fn();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Rendering', () => {
    it('should render file input', () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should render upload button', () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should show selected file name', async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/selected file: test\.pdf/i)).toBeInTheDocument();
      });
    });

    it('should show loading spinner during upload', async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      global.fetch.mockReturnValue(fetchPromise);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      // Verificar que se muestra el spinner
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Resolver la promesa
      resolveFetch!({
        ok: true,
        json: async () => ({
          filePath: 'uploads/test.pdf',
          fileType: 'application/pdf',
        }),
      });
    });

    it('should show success message after upload', async () => {
      const mockFileData = {
        filePath: 'uploads/test.pdf',
        fileType: 'application/pdf',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFileData,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/archivo subido con éxito/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Selection', () => {
    it('should handle file selection', () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should call onChange callback with selected file', () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should update file name display', async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test'], 'my-resume.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/selected file: my-resume\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Upload', () => {
    it('should upload file on button click', async () => {
      const mockFileData = {
        filePath: 'uploads/test.pdf',
        fileType: 'application/pdf',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFileData,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3010/upload',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });
    });

    it('should call onUpload callback with file data', async () => {
      const mockFileData = {
        filePath: 'uploads/test.pdf',
        fileType: 'application/pdf',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFileData,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(mockFileData);
      });
    });

    it('should show loading state during upload', async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      global.fetch.mockReturnValue(fetchPromise);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      // Verificar que se muestra el spinner
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Resolver la promesa
      resolveFetch!({
        ok: true,
        json: async () => ({
          filePath: 'uploads/test.pdf',
          fileType: 'application/pdf',
        }),
      });
    });

    it('should handle upload success', async () => {
      const mockFileData = {
        filePath: 'uploads/success.pdf',
        fileType: 'application/pdf',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFileData,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/archivo subido con éxito/i)).toBeInTheDocument();
      });

      expect(mockOnUpload).toHaveBeenCalledWith(mockFileData);
    });

    it('should handle upload errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should reset loading state after upload', async () => {
      const mockFileData = {
        filePath: 'uploads/test.pdf',
        fileType: 'application/pdf',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFileData,
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });

      // Después de la carga, el botón debería volver a su estado normal
      expect(uploadButton).toBeInTheDocument();
      // El spinner debería desaparecer después de la carga
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });
});
