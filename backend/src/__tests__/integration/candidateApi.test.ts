// Desactivar mocks para tests de integración
jest.unmock('@prisma/client');

import { PrismaClient } from '@prisma/client';
import { app } from '../../index';
import request from 'supertest';
import { cleanupDatabase, closePrismaConnection, createTestCandidateData } from '../helpers/testHelpers';

const prisma = new PrismaClient();

describe('Candidate API Integration Tests', () => {
  beforeAll(async () => {
    // Asegurar que la base de datos esté lista
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada test
    await cleanupDatabase();
  });

  afterAll(async () => {
    // Cerrar conexión después de todos los tests
    await closePrismaConnection();
  });

  describe('POST /candidates', () => {
    it('should create candidate end-to-end', async () => {
      const candidateData = createTestCandidateData();

      const response = await request(app)
        .post('/candidates')
        .send({
          ...candidateData,
          educations: candidateData.educations.map(edu => ({
            ...edu,
            startDate: edu.startDate.toISOString().slice(0, 10),
            endDate: edu.endDate?.toISOString().slice(0, 10),
          })),
          workExperiences: candidateData.workExperiences.map(exp => ({
            ...exp,
            startDate: exp.startDate.toISOString().slice(0, 10),
            endDate: exp.endDate?.toISOString().slice(0, 10),
          })),
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(candidateData.firstName);
      expect(response.body.data.lastName).toBe(candidateData.lastName);
      expect(response.body.data.email).toBe(candidateData.email);

      // Verificar que se guardó en la base de datos
      const candidateId = response.body.data.id;
      const savedCandidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      expect(savedCandidate).not.toBeNull();
      expect(savedCandidate?.firstName).toBe(candidateData.firstName);
    });

    it('should create candidate with all related data', async () => {
      const candidateData = createTestCandidateData({
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
      });

      const response = await request(app)
        .post('/candidates')
        .send({
          ...candidateData,
          educations: candidateData.educations.map(edu => ({
            ...edu,
            startDate: edu.startDate.toISOString().slice(0, 10),
            endDate: edu.endDate?.toISOString().slice(0, 10),
          })),
          workExperiences: candidateData.workExperiences.map(exp => ({
            ...exp,
            startDate: exp.startDate.toISOString().slice(0, 10),
            endDate: exp.endDate?.toISOString().slice(0, 10),
          })),
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');

      // Verificar que se guardaron las relaciones
      const candidateId = response.body.data.id;
      const savedCandidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          educations: true,
          workExperiences: true,
          resumes: true,
        },
      });

      expect(savedCandidate).not.toBeNull();
      expect(savedCandidate?.educations.length).toBeGreaterThan(0);
      expect(savedCandidate?.workExperiences.length).toBeGreaterThan(0);
      expect(savedCandidate?.resumes.length).toBeGreaterThan(0);
    });

    it('should persist data correctly in database', async () => {
      const candidateData = createTestCandidateData();

      const response = await request(app)
        .post('/candidates')
        .send(candidateData)
        .expect(201);

      const candidateId = response.body.data.id;

      // Verificar todos los campos en la base de datos
      const savedCandidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      expect(savedCandidate).not.toBeNull();
      expect(savedCandidate?.firstName).toBe(candidateData.firstName);
      expect(savedCandidate?.lastName).toBe(candidateData.lastName);
      expect(savedCandidate?.email).toBe(candidateData.email);
      expect(savedCandidate?.phone).toBe(candidateData.phone);
      expect(savedCandidate?.address).toBe(candidateData.address);
    });

    it('should return correct response format', async () => {
      const candidateData = createTestCandidateData();

      const response = await request(app)
        .post('/candidates')
        .send(candidateData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
      expect(response.body.data).toHaveProperty('email');
      expect(typeof response.body.data.id).toBe('number');
      expect(typeof response.body.data.firstName).toBe('string');
      expect(typeof response.body.data.lastName).toBe('string');
      expect(typeof response.body.data.email).toBe('string');
    });

    it('should reject invalid candidate data', async () => {
      const invalidData = {
        firstName: 'J', // Muy corto
        lastName: 'Doe',
        email: 'invalid-email', // Email inválido
      };

      const response = await request(app)
        .post('/candidates')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const candidateData = createTestCandidateData();

      // Crear primer candidato
      await request(app)
        .post('/candidates')
        .send(candidateData)
        .expect(201);

      // Intentar crear otro con el mismo email
      const response = await request(app)
        .post('/candidates')
        .send(candidateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /candidates/:id', () => {
    it('should retrieve candidate with all relations', async () => {
      // Primero crear un candidato con relaciones
      const candidateData = createTestCandidateData({
        educations: [
          {
            institution: 'University',
            title: 'BSc',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2023-01-01'),
          },
        ],
        workExperiences: [
          {
            company: 'Company',
            position: 'Developer',
            startDate: new Date('2021-01-01'),
            endDate: new Date('2022-01-01'),
          },
        ],
      });

      const createResponse = await request(app)
        .post('/candidates')
        .send({
          ...candidateData,
          educations: candidateData.educations.map(edu => ({
            ...edu,
            startDate: edu.startDate.toISOString().slice(0, 10),
            endDate: edu.endDate?.toISOString().slice(0, 10),
          })),
          workExperiences: candidateData.workExperiences.map(exp => ({
            ...exp,
            startDate: exp.startDate.toISOString().slice(0, 10),
            endDate: exp.endDate?.toISOString().slice(0, 10),
          })),
        })
        .expect(201);

      const candidateId = createResponse.body.data.id;

      // Obtener el candidato
      const response = await request(app)
        .get(`/candidates/${candidateId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', candidateId);
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent candidate', async () => {
      const response = await request(app)
        .get('/candidates/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/candidates/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});

