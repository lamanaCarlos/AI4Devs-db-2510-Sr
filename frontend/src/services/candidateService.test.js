import axios from 'axios';
import { uploadCV, sendCandidateData } from './candidateService';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios;

describe('CandidateService (Frontend)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCV', () => {
    it('should upload file successfully', async () => {
      const mockFile = new File(['test content'], 'cv.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          filePath: 'uploads/1234567890-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await uploadCV(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Verificar que el FormData contiene el archivo
      const formDataCall = mockedAxios.post.mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);

      expect(result).toEqual(mockResponse.data);
      expect(result.filePath).toBe('uploads/1234567890-cv.pdf');
      expect(result.fileType).toBe('application/pdf');
    });

    it('should return filePath and fileType', async () => {
      const mockFile = new File(['test'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const mockResponse = {
        data: {
          filePath: 'uploads/1234567890-resume.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await uploadCV(mockFile);

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('fileType');
      expect(result.filePath).toBe('uploads/1234567890-resume.docx');
      expect(result.fileType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const mockError = {
        response: {
          data: { error: 'File too large' },
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      await expect(uploadCV(mockFile)).rejects.toThrow('Error al subir el archivo:');
    });

    it('should send correct FormData', async () => {
      const mockFile = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await uploadCV(mockFile);

      const formData = mockedAxios.post.mock.calls[0][1];
      expect(formData).toBeInstanceOf(FormData);
      // Verificar que el archivo está en el FormData
      expect(formData.has('file')).toBe(true);
    });

    it('should use correct endpoint', async () => {
      const mockFile = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await uploadCV(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/upload',
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });

  describe('sendCandidateData', () => {
    it('should send candidate data successfully', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
      };

      const mockResponse = {
        data: {
          id: 1,
          ...candidateData,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await sendCandidateData(candidateData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        candidateData
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('John');
    });

    it('should return response data', async () => {
      const candidateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      const mockResponse = {
        data: {
          id: 2,
          ...candidateData,
          message: 'Candidate added successfully',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await sendCandidateData(candidateData);

      expect(result).toEqual(mockResponse.data);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('message');
    });

    it('should handle network errors', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(sendCandidateData(candidateData)).rejects.toThrow();
    });

    it('should handle validation errors from server', async () => {
      const candidateData = {
        firstName: 'John',
        email: 'invalid-email',
      };

      const validationError = {
        response: {
          data: { message: 'Invalid email format' },
        },
      };

      mockedAxios.post.mockRejectedValue(validationError);

      await expect(sendCandidateData(candidateData)).rejects.toThrow('Error al enviar datos del candidato:');
    });

    it('should send data in correct format', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        educations: [
          {
            institution: 'University',
            title: 'Computer Science',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Company',
            position: 'Developer',
            startDate: '2021-01-01',
            endDate: '2022-01-01',
          },
        ],
      };

      const mockResponse = {
        data: {
          id: 1,
          ...candidateData,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await sendCandidateData(candidateData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        candidateData
      );

      const sentData = mockedAxios.post.mock.calls[0][1];
      expect(sentData).toHaveProperty('firstName');
      expect(sentData).toHaveProperty('educations');
      expect(sentData).toHaveProperty('workExperiences');
    });

    it('should use correct endpoint', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const mockResponse = {
        data: {
          id: 1,
          ...candidateData,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await sendCandidateData(candidateData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        expect.any(Object)
      );
    });
  });
});
