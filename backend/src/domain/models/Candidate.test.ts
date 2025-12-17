// Mock debe estar ANTES de cualquier import
const mockCandidateCreate = jest.fn();
const mockCandidateUpdate = jest.fn();
const mockCandidateFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        create: mockCandidateCreate,
        update: mockCandidateUpdate,
        findUnique: mockCandidateFindUnique,
      },
    })),
    Prisma: {
      PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
        constructor(message: string, clientVersion: string, errorCode?: string) {
          super(message);
          this.name = 'PrismaClientInitializationError';
        }
      },
    },
  };
});

import { Candidate } from './Candidate';
import { Education } from './Education';
import { WorkExperience } from './WorkExperience';
import { Resume } from './Resume';
import { PrismaClient, Prisma } from '@prisma/client';

// Mock de los modelos relacionados
jest.mock('./Education');
jest.mock('./WorkExperience');
jest.mock('./Resume');

describe('Candidate Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a Candidate instance with valid data', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
      };

      const candidate = new Candidate(data);

      expect(candidate.firstName).toBe('John');
      expect(candidate.lastName).toBe('Doe');
      expect(candidate.email).toBe('john.doe@example.com');
      expect(candidate.phone).toBe('612345678');
      expect(candidate.address).toBe('123 Main St');
    });

    it('should handle optional fields (phone, address)', () => {
      const data = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      const candidate = new Candidate(data);

      expect(candidate.firstName).toBe('Jane');
      expect(candidate.lastName).toBe('Smith');
      expect(candidate.email).toBe('jane.smith@example.com');
      expect(candidate.phone).toBeUndefined();
      expect(candidate.address).toBeUndefined();
    });

    it('should initialize empty arrays for education, workExperience, resumes', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const candidate = new Candidate(data);

      expect(candidate.education).toEqual([]);
      expect(candidate.workExperience).toEqual([]);
      expect(candidate.resumes).toEqual([]);
    });

    it('should initialize with provided education, workExperience, and resumes', () => {
      const education = new Education({ institution: 'University', title: 'BSc' });
      const workExp = new WorkExperience({ company: 'Company', position: 'Developer' });
      const resume = new Resume({ filePath: 'cv.pdf', fileType: 'application/pdf' });

      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        education: [education],
        workExperience: [workExp],
        resumes: [resume],
      };

      const candidate = new Candidate(data);

      expect(candidate.education).toEqual([education]);
      expect(candidate.workExperience).toEqual([workExp]);
      expect(candidate.resumes).toEqual([resume]);
    });
  });

  describe('save() - Create', () => {
    it('should create a new candidate in database', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const createdCandidate = { id: 1, ...candidateData };
      mockCandidateCreate.mockResolvedValue(createdCandidate);

      const candidate = new Candidate(candidateData);
      const result = await candidate.save();

      expect(mockCandidateCreate).toHaveBeenCalledWith({
        data: candidateData,
      });
      expect(result).toEqual(createdCandidate);
    });

    it('should create candidate with educations', async () => {
      const educationData = {
        institution: 'University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      };

      const education = new Education(educationData);
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        education: [education],
      };

      const createdCandidate = { id: 1, ...candidateData };
      mockCandidateCreate.mockResolvedValue(createdCandidate);

      const candidate = new Candidate(candidateData);
      await candidate.save();

      // Verificar que se llamó al mock (puede ser con diferentes estructuras de datos)
      expect(mockCandidateCreate).toHaveBeenCalled();
      const callArgs = mockCandidateCreate.mock.calls[0][0];
      expect(callArgs.data).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(callArgs.data.educations).toBeDefined();
    });

    it('should create candidate with workExperiences', async () => {
      const workExpData = {
        company: 'Company',
        position: 'Developer',
        description: 'Software development',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-01-01'),
      };

      const workExp = new WorkExperience(workExpData);
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        workExperience: [workExp],
      };

      const createdCandidate = { id: 1, ...candidateData };
      mockCandidateCreate.mockResolvedValue(createdCandidate);

      const candidate = new Candidate(candidateData);
      await candidate.save();

      // Verificar que se llamó al mock
      expect(mockCandidateCreate).toHaveBeenCalled();
      const callArgs = mockCandidateCreate.mock.calls[0][0];
      expect(callArgs.data).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(callArgs.data.workExperiences).toBeDefined();
    });

    it('should create candidate with resumes', async () => {
      const resumeData = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
      };

      const resume = new Resume(resumeData);
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        resumes: [resume],
      };

      const createdCandidate = { id: 1, ...candidateData };
      mockCandidateCreate.mockResolvedValue(createdCandidate);

      const candidate = new Candidate(candidateData);
      await candidate.save();

      // Verificar que se llamó al mock
      expect(mockCandidateCreate).toHaveBeenCalled();
      const callArgs = mockCandidateCreate.mock.calls[0][0];
      expect(callArgs.data).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(callArgs.data.resumes).toBeDefined();
    });

    it('should create candidate with all related data', async () => {
      const education = new Education({
        institution: 'University',
        title: 'BSc',
        startDate: new Date('2020-01-01'),
      });
      const workExp = new WorkExperience({
        company: 'Company',
        position: 'Developer',
        startDate: new Date('2021-01-01'),
      });
      const resume = new Resume({
        filePath: 'cv.pdf',
        fileType: 'application/pdf',
      });

      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        education: [education],
        workExperience: [workExp],
        resumes: [resume],
      };

      const createdCandidate = { id: 1, ...candidateData };
      mockCandidateCreate.mockResolvedValue(createdCandidate);

      const candidate = new Candidate(candidateData);
      await candidate.save();

      expect(mockCandidateCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          educations: expect.any(Object),
          workExperiences: expect.any(Object),
          resumes: expect.any(Object),
        }),
      });
    });

    it('should throw error on database connection failure', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const dbError = new Prisma.PrismaClientInitializationError('Connection failed', '5.13.0');
      mockCandidateCreate.mockRejectedValue(dbError);

      const candidate = new Candidate(candidateData);

      await expect(candidate.save()).rejects.toThrow();
    });

    it('should throw error on duplicate email (P2002)', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const duplicateError = { code: 'P2002', message: 'Unique constraint failed' };
      mockCandidateCreate.mockRejectedValue(duplicateError);

      const candidate = new Candidate(candidateData);

      await expect(candidate.save()).rejects.toEqual(duplicateError);
    });
  });

  describe('save() - Update', () => {
    it('should update existing candidate', async () => {
      const candidateData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const updatedCandidate = { ...candidateData, phone: '612345678' };
      mockCandidateUpdate.mockResolvedValue(updatedCandidate);

      const candidate = new Candidate(candidateData);
      candidate.phone = '612345678';
      const result = await candidate.save();

      expect(mockCandidateUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '612345678',
        },
      });
      expect(result).toEqual(updatedCandidate);
    });

    it('should throw error if candidate not found (P2025)', async () => {
      const candidateData = {
        id: 999,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const notFoundError = { code: 'P2025', message: 'Record not found' };
      mockCandidateUpdate.mockRejectedValue(notFoundError);

      const candidate = new Candidate(candidateData);

      await expect(candidate.save()).rejects.toThrow(
        'No se pudo encontrar el registro del candidato con el ID proporcionado.'
      );
    });

    it('should update candidate with new educations', async () => {
      const education = new Education({
        institution: 'New University',
        title: 'MSc',
        startDate: new Date('2023-01-01'),
      });

      const candidateData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        education: [education],
      };

      const updatedCandidate = { ...candidateData, id: 1 };
      mockCandidateUpdate.mockResolvedValue(updatedCandidate);

      const candidate = new Candidate(candidateData);
      await candidate.save();

      expect(mockCandidateUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          educations: expect.any(Object),
        }),
      });
    });

    it('should handle database connection error on update', async () => {
      const candidateData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const dbError = new Prisma.PrismaClientInitializationError('Connection failed', '5.13.0');
      mockCandidateUpdate.mockRejectedValue(dbError);

      const candidate = new Candidate(candidateData);

      await expect(candidate.save()).rejects.toThrow();
    });
  });

  describe('findOne()', () => {
    it('should return Candidate instance for valid ID', async () => {
      const candidateData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
      };

      mockCandidateFindUnique.mockResolvedValue(candidateData);

      const result = await Candidate.findOne(1);

      expect(mockCandidateFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBeInstanceOf(Candidate);
      expect(result?.id).toBe(1);
      expect(result?.firstName).toBe('John');
      expect(result?.lastName).toBe('Doe');
      expect(result?.email).toBe('john.doe@example.com');
    });

    it('should return null for non-existent ID', async () => {
      mockCandidateFindUnique.mockResolvedValue(null);

      const result = await Candidate.findOne(999);

      expect(mockCandidateFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection error');
      mockCandidateFindUnique.mockRejectedValue(dbError);

      await expect(Candidate.findOne(1)).rejects.toThrow('Database connection error');
    });
  });
});

