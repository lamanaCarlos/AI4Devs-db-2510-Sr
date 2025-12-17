// Mock debe estar ANTES de cualquier import
const mockWorkExperienceCreate = jest.fn();
const mockWorkExperienceUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      workExperience: {
        create: mockWorkExperienceCreate,
        update: mockWorkExperienceUpdate,
      },
    })),
  };
});

import { WorkExperience } from './WorkExperience';
import { PrismaClient } from '@prisma/client';

describe('WorkExperience Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create WorkExperience instance with valid data', () => {
      const data = {
        company: 'Tech Company',
        position: 'Software Developer',
        description: 'Developed web applications',
        startDate: '2021-01-01',
        endDate: '2022-01-01',
      };

      const workExp = new WorkExperience(data);

      expect(workExp.company).toBe('Tech Company');
      expect(workExp.position).toBe('Software Developer');
      expect(workExp.description).toBe('Developed web applications');
      expect(workExp.startDate).toBeInstanceOf(Date);
      expect(workExp.endDate).toBeInstanceOf(Date);
    });

    it('should handle optional description and endDate', () => {
      const data = {
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: '2021-01-01',
      };

      const workExp = new WorkExperience(data);

      expect(workExp.company).toBe('Tech Company');
      expect(workExp.position).toBe('Software Developer');
      expect(workExp.description).toBeUndefined();
      expect(workExp.startDate).toBeInstanceOf(Date);
      expect(workExp.endDate).toBeUndefined();
    });

    it('should parse date strings correctly', () => {
      const data = {
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: '2021-06-15',
        endDate: '2022-08-20',
      };

      const workExp = new WorkExperience(data);

      expect(workExp.startDate.getFullYear()).toBe(2021);
      expect(workExp.startDate.getMonth()).toBe(5); // Junio es 5
      expect(workExp.startDate.getDate()).toBe(15);
      
      expect(workExp.endDate?.getFullYear()).toBe(2022);
      expect(workExp.endDate?.getMonth()).toBe(7); // Agosto es 7
      expect(workExp.endDate?.getDate()).toBe(20);
    });

    it('should handle candidateId', () => {
      const data = {
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: '2021-01-01',
        candidateId: 1,
      };

      const workExp = new WorkExperience(data);

      expect(workExp.candidateId).toBe(1);
    });
  });

  describe('save() - Create', () => {
    it('should create workExperience in database', async () => {
      const workExpData = {
        company: 'Tech Company',
        position: 'Software Developer',
        description: 'Developed web applications',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-01-01'),
      };

      const createdWorkExp = { id: 1, ...workExpData };
      mockWorkExperienceCreate.mockResolvedValue(createdWorkExp);

      const workExp = new WorkExperience(workExpData);
      const result = await workExp.save();

      expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
        data: workExpData,
      });
      expect(result).toEqual(createdWorkExp);
    });

    it('should create workExperience with candidateId', async () => {
      const workExpData = {
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: new Date('2021-01-01'),
        candidateId: 1,
      };

      const createdWorkExp = { id: 1, ...workExpData };
      mockWorkExperienceCreate.mockResolvedValue(createdWorkExp);

      const workExp = new WorkExperience(workExpData);
      const result = await workExp.save();

      expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
        data: {
          company: 'Tech Company',
          position: 'Software Developer',
          description: undefined,
          startDate: workExpData.startDate,
          endDate: undefined,
          candidateId: 1,
        },
      });
      expect(result).toEqual(createdWorkExp);
    });

    it('should handle database errors', async () => {
      const workExpData = {
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: new Date('2021-01-01'),
      };

      const dbError = new Error('Database connection error');
      mockWorkExperienceCreate.mockRejectedValue(dbError);

      const workExp = new WorkExperience(workExpData);

      await expect(workExp.save()).rejects.toThrow('Database connection error');
    });
  });

  describe('save() - Update', () => {
    it('should update existing workExperience', async () => {
      const workExpData = {
        id: 1,
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-01-01'),
      };

      const updatedWorkExp = { ...workExpData, position: 'Senior Developer' };
      mockWorkExperienceUpdate.mockResolvedValue(updatedWorkExp);

      const workExp = new WorkExperience(workExpData);
      workExp.position = 'Senior Developer';
      const result = await workExp.save();

      expect(mockWorkExperienceUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          company: 'Tech Company',
          position: 'Senior Developer',
          description: undefined,
          startDate: workExpData.startDate,
          endDate: workExpData.endDate,
        },
      });
      expect(result).toEqual(updatedWorkExp);
    });

    it('should throw error if workExperience not found', async () => {
      const workExpData = {
        id: 999,
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: new Date('2021-01-01'),
      };

      const notFoundError = { code: 'P2025', message: 'Record not found' };
      mockWorkExperienceUpdate.mockRejectedValue(notFoundError);

      const workExp = new WorkExperience(workExpData);

      await expect(workExp.save()).rejects.toEqual(notFoundError);
    });

    it('should update workExperience with candidateId', async () => {
      const workExpData = {
        id: 1,
        company: 'Tech Company',
        position: 'Software Developer',
        startDate: new Date('2021-01-01'),
        candidateId: 2,
      };

      const updatedWorkExp = { ...workExpData };
      mockWorkExperienceUpdate.mockResolvedValue(updatedWorkExp);

      const workExp = new WorkExperience(workExpData);
      await workExp.save();

      expect(mockWorkExperienceUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          candidateId: 2,
        }),
      });
    });
  });
});

