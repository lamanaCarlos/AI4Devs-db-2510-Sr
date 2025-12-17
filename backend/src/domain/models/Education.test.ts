// Mock debe estar ANTES de cualquier import
const mockEducationCreate = jest.fn();
const mockEducationUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      education: {
        create: mockEducationCreate,
        update: mockEducationUpdate,
      },
    })),
  };
});

import { Education } from './Education';
import { PrismaClient } from '@prisma/client';

describe('Education Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create Education instance with valid data', () => {
      const data = {
        institution: 'University',
        title: 'Computer Science',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
      };

      const education = new Education(data);

      expect(education.institution).toBe('University');
      expect(education.title).toBe('Computer Science');
      expect(education.startDate).toBeInstanceOf(Date);
      expect(education.endDate).toBeInstanceOf(Date);
    });

    it('should handle optional endDate', () => {
      const data = {
        institution: 'University',
        title: 'Computer Science',
        startDate: '2020-01-01',
      };

      const education = new Education(data);

      expect(education.institution).toBe('University');
      expect(education.title).toBe('Computer Science');
      expect(education.startDate).toBeInstanceOf(Date);
      expect(education.endDate).toBeUndefined();
    });

    it('should parse date strings correctly', () => {
      const data = {
        institution: 'University',
        title: 'Computer Science',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
      };

      const education = new Education(data);

      expect(education.startDate.getFullYear()).toBe(2020);
      expect(education.startDate.getMonth()).toBe(0); // Enero es 0
      expect(education.startDate.getDate()).toBe(1);
      
      expect(education.endDate?.getFullYear()).toBe(2023);
      expect(education.endDate?.getMonth()).toBe(11); // Diciembre es 11
      expect(education.endDate?.getDate()).toBe(31);
    });

    it('should handle candidateId', () => {
      const data = {
        institution: 'University',
        title: 'Computer Science',
        startDate: '2020-01-01',
        candidateId: 1,
      };

      const education = new Education(data);

      expect(education.candidateId).toBe(1);
    });
  });

  describe('save() - Create', () => {
    it('should create education in database', async () => {
      const educationData = {
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      };

      const createdEducation = { id: 1, ...educationData };
      mockEducationCreate.mockResolvedValue(createdEducation);

      const education = new Education(educationData);
      const result = await education.save();

      expect(mockEducationCreate).toHaveBeenCalledWith({
        data: educationData,
      });
      expect(result).toEqual(createdEducation);
    });

    it('should create education with candidateId', async () => {
      const educationData = {
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        candidateId: 1,
      };

      const createdEducation = { id: 1, ...educationData };
      mockEducationCreate.mockResolvedValue(createdEducation);

      const education = new Education(educationData);
      const result = await education.save();

      expect(mockEducationCreate).toHaveBeenCalledWith({
        data: {
          institution: 'University',
          title: 'Computer Science',
          startDate: educationData.startDate,
          endDate: undefined,
          candidateId: 1,
        },
      });
      expect(result).toEqual(createdEducation);
    });

    it('should handle database errors', async () => {
      const educationData = {
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
      };

      const dbError = new Error('Database connection error');
      mockEducationCreate.mockRejectedValue(dbError);

      const education = new Education(educationData);

      await expect(education.save()).rejects.toThrow('Database connection error');
    });
  });

  describe('save() - Update', () => {
    it('should update existing education', async () => {
      const educationData = {
        id: 1,
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      };

      const updatedEducation = { ...educationData, title: 'Master in Computer Science' };
      mockEducationUpdate.mockResolvedValue(updatedEducation);

      const education = new Education(educationData);
      education.title = 'Master in Computer Science';
      const result = await education.save();

      expect(mockEducationUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          institution: 'University',
          title: 'Master in Computer Science',
          startDate: educationData.startDate,
          endDate: educationData.endDate,
        },
      });
      expect(result).toEqual(updatedEducation);
    });

    it('should throw error if education not found', async () => {
      const educationData = {
        id: 999,
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
      };

      const notFoundError = { code: 'P2025', message: 'Record not found' };
      mockEducationUpdate.mockRejectedValue(notFoundError);

      const education = new Education(educationData);

      await expect(education.save()).rejects.toEqual(notFoundError);
    });

    it('should update education with candidateId', async () => {
      const educationData = {
        id: 1,
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        candidateId: 2,
      };

      const updatedEducation = { ...educationData };
      mockEducationUpdate.mockResolvedValue(updatedEducation);

      const education = new Education(educationData);
      await education.save();

      expect(mockEducationUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          candidateId: 2,
        }),
      });
    });
  });
});
