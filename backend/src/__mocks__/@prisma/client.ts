/**
 * Mock de Prisma Client para tests
 * Este archivo proporciona mocks completos de todas las operaciones de Prisma
 * Nota: Los tests individuales pueden crear sus propios mocks más específicos
 */

export const PrismaClient = jest.fn().mockImplementation(() => ({
  candidate: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  education: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  resume: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
}));

export const Prisma = {
  PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
    constructor(message: string, clientVersion: string, errorCode?: string) {
      super(message);
      this.name = 'PrismaClientInitializationError';
    }
  },
};

export default PrismaClient;

