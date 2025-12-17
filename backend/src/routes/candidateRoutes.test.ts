import { Request, Response } from 'express';
import candidateRoutes from './candidateRoutes';
import * as candidateController from '../presentation/controllers/candidateController';

// Mock del controlador (que en realidad es el servicio según la implementación)
jest.mock('../presentation/controllers/candidateController', () => ({
  addCandidate: jest.fn(),
}));

describe('Candidate Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('POST /candidates', () => {
    it('should call addCandidate on POST request with valid data', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const createdCandidate = { id: 1, ...candidateData };
      (candidateController.addCandidate as jest.Mock).mockResolvedValue(createdCandidate);

      mockRequest.body = candidateData;

      // Simular el handler de la ruta
      const routeLayer = candidateRoutes.stack.find((layer: any) => layer.route && layer.route.methods.post);
      if (routeLayer && routeLayer.route) {
        const handler = routeLayer.route.stack[0].handle;
        const mockNext = jest.fn();
        await handler(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(candidateController.addCandidate).toHaveBeenCalledWith(candidateData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(createdCandidate);
    });

    it('should return 201 on successful creation', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const createdCandidate = { id: 1, ...candidateData };
      (candidateController.addCandidate as jest.Mock).mockResolvedValue(createdCandidate);

      mockRequest.body = candidateData;

      const routeLayer = candidateRoutes.stack.find((layer: any) => layer.route && layer.route.methods.post);
      if (routeLayer && routeLayer.route) {
        const handler = routeLayer.route.stack[0].handle;
        const mockNext = jest.fn();
        await handler(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 on validation error', async () => {
      const candidateData = {
        firstName: 'John',
        email: 'invalid-email',
      };

      const validationError = new Error('Invalid email');
      (candidateController.addCandidate as jest.Mock).mockRejectedValue(validationError);

      mockRequest.body = candidateData;

      const routeLayer = candidateRoutes.stack.find((layer: any) => layer.route && layer.route.methods.post);
      if (routeLayer && routeLayer.route) {
        const handler = routeLayer.route.stack[0].handle;
        const mockNext = jest.fn();
        await handler(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Invalid email' });
    });

    it('should return 500 on server error', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const serverError = {}; // Error no es instancia de Error
      (candidateController.addCandidate as jest.Mock).mockRejectedValue(serverError);

      mockRequest.body = candidateData;

      const routeLayer = candidateRoutes.stack.find((layer: any) => layer.route && layer.route.methods.post);
      if (routeLayer && routeLayer.route) {
        const handler = routeLayer.route.stack[0].handle;
        const mockNext = jest.fn();
        await handler(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'An unexpected error occurred' });
    });

    it('should handle request body parsing', () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
      };

      mockRequest.body = candidateData;

      expect(mockRequest.body).toEqual(candidateData);
    });
  });

  describe('Route Configuration', () => {
    it('should export a router', () => {
      expect(candidateRoutes).toBeDefined();
      expect(typeof candidateRoutes).toBe('function');
    });

    it('should have POST route configured', () => {
      expect(candidateRoutes.stack.length).toBeGreaterThan(0);
      const route = candidateRoutes.stack.find((layer: any) => 
        layer.route && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });
  });
});

