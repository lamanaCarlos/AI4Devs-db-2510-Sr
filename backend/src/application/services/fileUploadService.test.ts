// Mock de multer debe estar ANTES de cualquier import
const mockSingle = jest.fn();
const mockDiskStorage = jest.fn().mockReturnValue({});
const mockMulterInstance = {
  single: mockSingle,
};

jest.mock('multer', () => {
  const mockMulter = jest.fn(() => mockMulterInstance);
  (mockMulter as any).diskStorage = mockDiskStorage;
  (mockMulter as any).MulterError = class MulterError extends Error {
    code: string;
    constructor(code: string) {
      super(`Multer error: ${code}`);
      this.code = code;
      this.name = 'MulterError';
    }
  };
  return mockMulter;
});

import { Request, Response } from 'express';
import { uploadFile } from './fileUploadService';
import multer from 'multer';

describe('FileUploadService', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      file: undefined,
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('uploadFile', () => {
    it('should upload PDF file successfully', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'cv.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        destination: '../uploads/',
        filename: '1234567890-cv.pdf',
        path: 'uploads/1234567890-cv.pdf',
      } as Express.Multer.File;

      // El middleware debe ejecutarse inmediatamente cuando se llama a uploadFile
      mockSingle.mockImplementation(() => {
        return (req: Request, res: Response, callback: (err?: any) => void) => {
          req.file = mockFile;
          callback(null);
        };
      });

      uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        filePath: 'uploads/1234567890-cv.pdf',
        fileType: 'application/pdf',
      });
    });

    it('should upload DOCX file successfully', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'resume.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2048,
        destination: '../uploads/',
        filename: '1234567890-resume.docx',
        path: 'uploads/1234567890-resume.docx',
      } as Express.Multer.File;

      mockSingle.mockImplementation(() => {
        return (req: Request, res: Response, callback: (err?: any) => void) => {
          req.file = mockFile;
          callback(null);
        };
      });

      uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        filePath: 'uploads/1234567890-resume.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    });

    it('should reject non-PDF/DOCX files', () => {
      // El middleware debe ejecutarse sin archivo (rechazado por el filtro)
      mockSingle.mockImplementation(() => {
        return (req: Request, res: Response, callback: (err?: any) => void) => {
          req.file = undefined; // Archivo rechazado por el filtro
          callback(null);
        };
      });

      uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid file type, only PDF and DOCX are allowed!',
      });
    });

    it('should handle multer errors correctly', () => {
      const multerError = new multer.MulterError('LIMIT_FILE_SIZE');

      mockSingle.mockImplementation(() => {
        return (req: Request, res: Response, callback: (err?: any) => void) => {
          callback(multerError);
        };
      });

      uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: multerError.message,
      });
    });

    it('should handle file system errors', () => {
      const fsError = new Error('File system error');

      mockSingle.mockImplementation(() => {
        return (req: Request, res: Response, callback: (err?: any) => void) => {
          callback(fsError);
        };
      });

      uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: fsError.message,
      });
    });
  });
});
