/**
 * Helpers para tests de integración
 * Utilidades para limpiar y preparar la base de datos entre tests
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Limpia todas las tablas relacionadas con candidatos
 * Usar en afterEach de tests de integración
 */
export async function cleanupDatabase() {
  // Eliminar en orden inverso de dependencias
  await prisma.$transaction([
    prisma.resume.deleteMany({}),
    prisma.workExperience.deleteMany({}),
    prisma.education.deleteMany({}),
    prisma.candidate.deleteMany({}),
  ]);
}

/**
 * Cierra la conexión de Prisma
 * Usar en afterAll de tests de integración
 */
export async function closePrismaConnection() {
  await prisma.$disconnect();
}

/**
 * Crea datos de prueba para un candidato
 */
export function createTestCandidateData(overrides = {}) {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${Date.now()}@example.com`, // Email único
    phone: '612345678',
    address: '123 Main St',
    educations: [
      {
        institution: 'Test University',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      },
    ],
    workExperiences: [
      {
        company: 'Test Company',
        position: 'Developer',
        description: 'Test description',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-01-01'),
      },
    ],
    cv: {
      filePath: 'uploads/test-cv.pdf',
      fileType: 'application/pdf',
    },
    ...overrides,
  };
}

