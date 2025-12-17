import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FileUploader from '../../components/FileUploader';

// Mock de fetch global
global.fetch = jest.fn();

describe('FileUploader Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('File upload flow with service integration', () => {
    it('should upload file and call onUpload callback with result', async () => {
      const mockOnUpload = jest.fn();

      // Mock successful upload
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filePath: 'uploads/test-file.pdf',
          fileType: 'application/pdf',
        }),
      });

      render(<FileUploader onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      // Simulate file selection - use same pattern as unit tests
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
        configurable: true,
      });
      fireEvent.change(fileInput);

      // Click upload button
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      fireEvent.click(uploadButton);

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify callback was called with correct data
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith({
          filePath: 'uploads/test-file.pdf',
          fileType: 'application/pdf',
        });
      }, { timeout: 3000 });
    });

    it('should handle upload error gracefully', async () => {
      const mockOnUpload = jest.fn();

      // Mock failed upload
      global.fetch.mockRejectedValueOnce(new Error('Upload failed'));

      render(<FileUploader onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Click upload button
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      fireEvent.click(uploadButton);

      // Wait for error
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify callback was not called on error
      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('should show loading state during upload', async () => {
      const mockOnUpload = jest.fn();

      // Mock delayed upload
      let resolveUpload;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      global.fetch.mockReturnValueOnce(uploadPromise);

      render(<FileUploader onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Click upload button
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      fireEvent.click(uploadButton);

      // Verify loading state - button should be disabled
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /subir archivo/i });
        expect(button).toBeDisabled();
      }, { timeout: 1000 });

      // Resolve upload
      resolveUpload({
        ok: true,
        json: async () => ({
          filePath: 'uploads/test-file.pdf',
          fileType: 'application/pdf',
        }),
      });

      // Wait for completion
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('File type validation integration', () => {
    it('should accept PDF files', async () => {
      const mockOnUpload = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filePath: 'uploads/test.pdf',
          fileType: 'application/pdf',
        }),
      });

      render(<FileUploader onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const pdfFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      // Simulate file selection using the same pattern as unit tests
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile],
        writable: false,
        configurable: true,
      });
      fireEvent.change(fileInput);

      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      expect(mockOnUpload).toHaveBeenCalled();
    });
  });
});
