// Mock debe estar ANTES de cualquier import
const mockResumeCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      resume: {
        create: mockResumeCreate,
      },
    })),
  };
});

import { Resume } from './Resume';
import { PrismaClient } from '@prisma/client';

describe('Resume Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log para evitar output en tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create Resume instance with valid data', () => {
      const data = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const resume = new Resume(data);

      expect(resume.filePath).toBe('uploads/cv.pdf');
      expect(resume.fileType).toBe('application/pdf');
      expect(resume.candidateId).toBe(1);
      expect(resume.uploadDate).toBeInstanceOf(Date);
    });

    it('should set uploadDate to current date', () => {
      const beforeCreation = new Date();
      const data = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const resume = new Resume(data);
      const afterCreation = new Date();

      expect(resume.uploadDate.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(resume.uploadDate.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should handle optional id', () => {
      const data = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const resume = new Resume(data);

      expect(resume.id).toBeUndefined();
    });

    it('should handle existing id', () => {
      const data = {
        id: 1,
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const resume = new Resume(data);

      expect(resume.id).toBe(1);
    });
  });

  describe('save()', () => {
    it('should create resume in database', async () => {
      const resumeData = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const createdResume = {
        id: 1,
        ...resumeData,
        uploadDate: new Date(),
      };
      mockResumeCreate.mockResolvedValue(createdResume);

      const resume = new Resume(resumeData);
      const result = await resume.save();

      expect(mockResumeCreate).toHaveBeenCalledWith({
        data: {
          candidateId: 1,
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf',
          uploadDate: expect.any(Date),
        },
      });
      expect(result).toBeInstanceOf(Resume);
      expect(result.id).toBe(1);
    });

    it('should create resume with candidateId', async () => {
      const resumeData = {
        filePath: 'uploads/resume.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        candidateId: 2,
      };

      const createdResume = {
        id: 2,
        ...resumeData,
        uploadDate: new Date(),
      };
      mockResumeCreate.mockResolvedValue(createdResume);

      const resume = new Resume(resumeData);
      await resume.save();

      expect(mockResumeCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 2,
          filePath: 'uploads/resume.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      });
    });

    it('should throw error if trying to update existing resume', async () => {
      const resumeData = {
        id: 1,
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const resume = new Resume(resumeData);

      await expect(resume.save()).rejects.toThrow(
        'No se permite la actualización de un currículum existente.'
      );
    });

    it('should handle database errors', async () => {
      const resumeData = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const dbError = new Error('Database connection error');
      mockResumeCreate.mockRejectedValue(dbError);

      const resume = new Resume(resumeData);

      await expect(resume.save()).rejects.toThrow('Database connection error');
    });

    it('should return Resume instance after creation', async () => {
      const resumeData = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      };

      const createdResume = {
        id: 1,
        ...resumeData,
        uploadDate: new Date(),
      };
      mockResumeCreate.mockResolvedValue(createdResume);

      const resume = new Resume(resumeData);
      const result = await resume.save();

      expect(result).toBeInstanceOf(Resume);
      expect(result.id).toBe(1);
      expect(result.filePath).toBe('uploads/cv.pdf');
      expect(result.fileType).toBe('application/pdf');
      expect(result.candidateId).toBe(1);
    });
  });
});

