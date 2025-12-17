# Plan TDD - Sistema de Seguimiento de Talento (LTI)

## 📋 Resumen Ejecutivo

Este documento describe el plan de Test Driven Development (TDD) para el sistema de seguimiento de talento. El proyecto utiliza Jest como framework de testing tanto para frontend (React) como backend (Express + TypeScript).

**Comandos de ejecución:**
- Backend: `cd backend && npm run test`
- Frontend: `cd frontend && npm run test`

---

## 🎯 Objetivos del Plan TDD

1. Asegurar cobertura de tests para todos los requerimientos funcionales
2. Implementar tests siguiendo el ciclo Red-Green-Refactor
3. Mantener una cobertura mínima del 80% en código crítico
4. Validar integración entre componentes
5. Garantizar calidad y mantenibilidad del código

---

## 📊 Estado Actual de Tests

### ✅ Tests Existentes

**Backend:**
- ✅ `candidateService.test.ts` - Servicio de candidatos (parcial)
- ✅ `candidateController.test.ts` - Controlador de candidatos (parcial)
- ✅ `validator.test.ts` - Validaciones (completo)

**Frontend:**
- ❌ No hay tests implementados

### ⚠️ Tests Faltantes

**Backend:**
- Modelos de dominio (Candidate, Education, WorkExperience, Resume)
- Rutas (candidateRoutes)
- Servicio de subida de archivos (fileUploadService)
- Tests de integración
- Tests E2E de API

**Frontend:**
- Componentes React (AddCandidateForm, FileUploader, RecruiterDashboard)
- Servicios (candidateService.js)
- Tests de integración de componentes

---

## 🏗️ Arquitectura y Requerimientos

### Modelo de Datos (Prisma Schema)

1. **Candidate**
   - Campos: id, firstName, lastName, email (unique), phone, address
   - Relaciones: educations[], workExperiences[], resumes[]

2. **Education**
   - Campos: id, institution, title, startDate, endDate, candidateId

3. **WorkExperience**
   - Campos: id, company, position, description, startDate, endDate, candidateId

4. **Resume**
   - Campos: id, filePath, fileType, uploadDate, candidateId

### Endpoints API

1. `POST /candidates` - Crear candidato
2. `GET /candidates/:id` - Obtener candidato por ID
3. `POST /upload` - Subir archivo CV

---

## 📝 Plan de Implementación TDD

### FASE 1: Backend - Modelos de Dominio

#### 1.1 Tests para Modelo Candidate

**Archivo:** `backend/src/domain/models/Candidate.test.ts`

**Tests a implementar:**

```typescript
describe('Candidate Model', () => {
  describe('Constructor', () => {
    it('should create a Candidate instance with valid data')
    it('should handle optional fields (phone, address)')
    it('should initialize empty arrays for education, workExperience, resumes')
  })

  describe('save() - Create', () => {
    it('should create a new candidate in database')
    it('should create candidate with educations')
    it('should create candidate with workExperiences')
    it('should create candidate with resumes')
    it('should create candidate with all related data')
    it('should throw error on database connection failure')
    it('should throw error on duplicate email (P2002)')
  })

  describe('save() - Update', () => {
    it('should update existing candidate')
    it('should throw error if candidate not found (P2025)')
    it('should update candidate with new educations')
    it('should update candidate with new workExperiences')
  })

  describe('findOne()', () => {
    it('should return Candidate instance for valid ID')
    it('should return null for non-existent ID')
    it('should handle database connection errors')
  })
})
```

**Orden de implementación:**
1. Test constructor básico → Implementar constructor
2. Test save() create básico → Implementar save() create
3. Test save() con relaciones → Refactorizar save()
4. Test save() update → Implementar update
5. Test findOne() → Implementar findOne()

---

#### 1.2 Tests para Modelo Education

**Archivo:** `backend/src/domain/models/Education.test.ts`

**Tests a implementar:**

```typescript
describe('Education Model', () => {
  describe('Constructor', () => {
    it('should create Education instance with valid data')
    it('should handle optional endDate')
    it('should parse date strings correctly')
  })

  describe('save() - Create', () => {
    it('should create education in database')
    it('should create education with candidateId')
    it('should handle database errors')
  })

  describe('save() - Update', () => {
    it('should update existing education')
    it('should throw error if education not found')
  })
})
```

---

#### 1.3 Tests para Modelo WorkExperience

**Archivo:** `backend/src/domain/models/WorkExperience.test.ts`

**Tests a implementar:**

```typescript
describe('WorkExperience Model', () => {
  describe('Constructor', () => {
    it('should create WorkExperience instance with valid data')
    it('should handle optional description and endDate')
    it('should parse date strings correctly')
  })

  describe('save() - Create', () => {
    it('should create workExperience in database')
    it('should create workExperience with candidateId')
    it('should handle database errors')
  })

  describe('save() - Update', () => {
    it('should update existing workExperience')
    it('should throw error if workExperience not found')
  })
})
```

---

#### 1.4 Tests para Modelo Resume

**Archivo:** `backend/src/domain/models/Resume.test.ts`

**Tests a implementar:**

```typescript
describe('Resume Model', () => {
  describe('Constructor', () => {
    it('should create Resume instance with valid data')
    it('should set uploadDate to current date')
    it('should handle optional id')
  })

  describe('save()', () => {
    it('should create resume in database')
    it('should create resume with candidateId')
    it('should throw error if trying to update existing resume')
    it('should handle database errors')
  })
})
```

---

### FASE 2: Backend - Servicios

#### 2.1 Completar Tests de candidateService

**Archivo:** `backend/src/application/services/candidateService.test.ts`

**Tests adicionales a implementar:**

```typescript
describe('CandidateService - Additional Tests', () => {
  describe('addCandidate', () => {
    it('should handle candidate with multiple educations')
    it('should handle candidate with multiple workExperiences')
    it('should handle candidate without optional fields')
    it('should preserve data integrity when saving fails mid-process')
  })

  describe('getCandidateById', () => {
    it('should return candidate with all related data (educations, workExperiences, resumes)')
    it('should handle malformed ID gracefully')
  })

  // Nuevos métodos a implementar (si se requieren)
  describe('getAllCandidates', () => {
    it('should return list of all candidates')
    it('should return empty array if no candidates exist')
    it('should handle pagination')
  })

  describe('updateCandidate', () => {
    it('should update candidate successfully')
    it('should validate data before updating')
    it('should handle candidate not found')
  })

  describe('deleteCandidate', () => {
    it('should delete candidate and related data')
    it('should handle candidate not found')
  })
})
```

---

#### 2.2 Tests para fileUploadService

**Archivo:** `backend/src/application/services/fileUploadService.test.ts`

**Tests a implementar:**

```typescript
describe('FileUploadService', () => {
  describe('uploadFile', () => {
    it('should upload PDF file successfully')
    it('should upload DOCX file successfully')
    it('should reject non-PDF/DOCX files')
    it('should reject files larger than 10MB')
    it('should generate unique filename')
    it('should save file to correct directory')
    it('should return filePath and fileType in response')
    it('should handle multer errors correctly')
    it('should handle file system errors')
  })
})
```

---

### FASE 3: Backend - Controladores

#### 3.1 Completar Tests de candidateController

**Archivo:** `backend/src/presentation/controllers/candidateController.test.ts`

**Tests adicionales a implementar:**

```typescript
describe('CandidateController - Additional Tests', () => {
  describe('addCandidateController', () => {
    it('should handle malformed JSON in request body')
    it('should handle missing required fields')
    it('should log errors appropriately')
  })

  describe('getCandidateByIdController', () => {
    it('should handle string ID conversion edge cases')
    it('should handle negative IDs')
    it('should handle very large IDs')
  })
})
```

---

### FASE 4: Backend - Rutas

#### 4.1 Tests para candidateRoutes

**Archivo:** `backend/src/routes/candidateRoutes.test.ts`

**Tests a implementar:**

```typescript
describe('Candidate Routes', () => {
  describe('POST /candidates', () => {
    it('should call addCandidate controller on POST request')
    it('should return 201 on successful creation')
    it('should return 400 on validation error')
    it('should return 500 on server error')
    it('should handle request body parsing')
  })

  describe('GET /candidates/:id', () => {
    it('should call getCandidateById controller on GET request')
    it('should return 200 on successful retrieval')
    it('should return 404 on candidate not found')
    it('should return 400 on invalid ID')
  })
})
```

---

### FASE 5: Backend - Tests de Integración

#### 5.1 Tests de Integración de API

**Archivo:** `backend/src/__tests__/integration/candidateApi.test.ts`

**Tests a implementar:**

```typescript
describe('Candidate API Integration Tests', () => {
  beforeEach(() => {
    // Setup test database
  })

  afterEach(() => {
    // Cleanup test data
  })

  describe('POST /candidates', () => {
    it('should create candidate end-to-end')
    it('should create candidate with all related data')
    it('should persist data correctly in database')
    it('should return correct response format')
  })

  describe('GET /candidates/:id', () => {
    it('should retrieve candidate with all relations')
    it('should return 404 for non-existent candidate')
  })

  describe('POST /upload', () => {
    it('should upload file and return file info')
    it('should reject invalid file types')
  })
})
```

**Nota:** Usar PostgreSQL del mismo proyecto. Implementar limpieza de datos entre tests usando transacciones o truncate.

---

### FASE 6: Frontend - Servicios

#### 6.1 Tests para candidateService (Frontend)

**Archivo:** `frontend/src/services/candidateService.test.js` o `.test.ts`

**Tests a implementar:**

```typescript
describe('CandidateService (Frontend)', () => {
  describe('uploadCV', () => {
    it('should upload file successfully')
    it('should return filePath and fileType')
    it('should handle upload errors')
    it('should send correct FormData')
    it('should use correct endpoint')
  })

  describe('sendCandidateData', () => {
    it('should send candidate data successfully')
    it('should return response data')
    it('should handle network errors')
    it('should handle validation errors from server')
    it('should send data in correct format')
    it('should use correct endpoint')
  })
})
```

**Configuración necesaria:**
- Mock de axios
- Mock de fetch API
- Configurar Jest para React (verificar si existe jest.config.js en frontend)

---

### FASE 7: Frontend - Componentes

#### 7.1 Tests para AddCandidateForm

**Archivo:** `frontend/src/components/AddCandidateForm.test.js` o `.test.tsx`

**Tests a implementar:**

```typescript
describe('AddCandidateForm', () => {
  describe('Rendering', () => {
    it('should render all form fields')
    it('should render education section when added')
    it('should render work experience section when added')
    it('should render FileUploader component')
    it('should render submit button')
    it('should render error messages when present')
    it('should render success messages when present')
  })

  describe('User Interactions', () => {
    it('should update firstName on input change')
    it('should update lastName on input change')
    it('should update email on input change')
    it('should update phone on input change')
    it('should update address on input change')
    it('should add education section on button click')
    it('should remove education section on delete click')
    it('should add work experience section on button click')
    it('should remove work experience section on delete click')
    it('should update education fields on change')
    it('should update work experience fields on change')
    it('should handle date picker changes')
  })

  describe('Form Submission', () => {
    it('should submit form with valid data')
    it('should format dates correctly before submission')
    it('should show success message on successful submission')
    it('should show error message on failed submission')
    it('should reset form after successful submission')
    it('should handle CV upload data in submission')
    it('should prevent submission with invalid data')
  })

  describe('Validation', () => {
    it('should validate required fields')
    it('should show validation errors')
  })
})
```

**Librerías necesarias:**
- @testing-library/react
- @testing-library/user-event
- @testing-library/jest-dom

---

#### 7.2 Tests para FileUploader

**Archivo:** `frontend/src/components/FileUploader.test.js` o `.test.tsx`

**Tests a implementar:**

```typescript
describe('FileUploader', () => {
  describe('Rendering', () => {
    it('should render file input')
    it('should render upload button')
    it('should show selected file name')
    it('should show loading spinner during upload')
    it('should show success message after upload')
  })

  describe('File Selection', () => {
    it('should handle file selection')
    it('should call onChange callback with selected file')
    it('should update file name display')
  })

  describe('File Upload', () => {
    it('should upload file on button click')
    it('should call onUpload callback with file data')
    it('should show loading state during upload')
    it('should handle upload success')
    it('should handle upload errors')
    it('should reset loading state after upload')
  })
})
```

---

#### 7.3 Tests para RecruiterDashboard

**Archivo:** `frontend/src/components/RecruiterDashboard.test.js` o `.test.tsx`

**Tests a implementar:**

```typescript
describe('RecruiterDashboard', () => {
  describe('Rendering', () => {
    it('should render logo')
    it('should render dashboard title')
    it('should render "Add Candidate" card')
    it('should render link to add candidate page')
  })

  describe('Navigation', () => {
    it('should navigate to add candidate page on button click')
  })
})
```

---

### FASE 8: Frontend - Tests de Integración

#### 8.1 Tests de Integración de Componentes

**Archivo:** `frontend/src/__tests__/integration/candidateFlow.test.js` o `.test.tsx`

**Tests a implementar:**

```typescript
describe('Candidate Flow Integration', () => {
  it('should complete full candidate creation flow')
  it('should handle file upload and form submission together')
  it('should show correct feedback throughout the process')
})
```

---

## 🔧 Configuración Necesaria

### Backend

1. **Jest Configuration** (ya existe en `backend/jest.config.js`)
   - Verificar que esté configurado correctamente
   - Añadir setupFiles si es necesario para mocks globales

2. **Dependencias de Testing:**
   ```json
   {
     "@types/jest": "^29.5.12",
     "jest": "^29.7.0",
     "ts-jest": "^29.2.5"
   }
   ```
   ✅ Ya instaladas

3. **Mock de Prisma:**
   - ✅ Creado `backend/src/__mocks__/@prisma/client.ts` para mocks de Prisma Client
   - Mock completo de todas las operaciones CRUD para candidate, education, workExperience, resume
   - Usar mocks completos en todos los tests unitarios

4. **Base de Datos de Test:**
   - ✅ Usar PostgreSQL del mismo proyecto
   - ✅ Creado `backend/src/__tests__/helpers/testHelpers.ts` con:
     - `cleanupDatabase()`: Limpia todas las tablas relacionadas
     - `closePrismaConnection()`: Cierra conexión de Prisma
     - `createTestCandidateData()`: Genera datos de prueba
   - Usar cleanupDatabase() en afterEach de tests de integración

### Frontend

1. **Jest Configuration:**
   - ✅ Creado `frontend/jest.config.js` con configuración para React + TypeScript
   - Configurado para usar jsdom como testEnvironment
   - Mapeo de archivos estáticos (CSS, imágenes) a mocks

2. **Dependencias de Testing:**
   ```json
   {
     "@testing-library/jest-dom": "^5.17.0",
     "@testing-library/react": "^13.4.0",
     "@testing-library/user-event": "^13.5.0"
   }
   ```
   ✅ Ya instaladas

3. **Setup de Tests:**
   - ✅ Creado `frontend/src/setupTests.ts` con:
     - Import de @testing-library/jest-dom
     - Mock global de fetch
     - Mock de window.matchMedia (para react-datepicker)
     - Mock de FormData
   - ✅ Configurar mocks completos de fetch/axios para todas las llamadas HTTP
   - Usar jest.mock() para mockear servicios HTTP

4. **Mocks Adicionales:**
   - ✅ Creado `frontend/__mocks__/fileMock.js` para archivos estáticos

---

## 📈 Métricas y Cobertura

### Objetivos de Cobertura

- **Backend:**
  - Servicios: 90%+
  - Controladores: 85%+
  - Modelos: 80%+
  - Validadores: 95%+ (ya alcanzado)
  - Rutas: 80%+

- **Frontend:**
  - Componentes: 80%+
  - Servicios: 85%+

### Comandos de Cobertura

```bash
# Backend
cd backend && npm run test -- --coverage

# Frontend
cd frontend && npm run test -- --coverage
```

---

## 🚀 Orden de Ejecución Recomendado

### Sprint 1: Fundamentos Backend
1. Tests de modelos de dominio (Candidate, Education, WorkExperience, Resume)
2. Completar tests de candidateService
3. Tests de fileUploadService

### Sprint 2: API Backend
4. Completar tests de candidateController
5. Tests de candidateRoutes
6. Tests de integración de API

### Sprint 3: Frontend Básico
7. Tests de candidateService (frontend)
8. Tests de FileUploader
9. Tests de RecruiterDashboard

### Sprint 4: Frontend Completo
10. Tests de AddCandidateForm
11. Tests de integración de componentes

### Sprint 5: Refinamiento
12. Revisión de cobertura
13. Optimización de tests
14. Documentación

---

## ✅ Checklist de Implementación

### Backend
- [ ] Candidate.test.ts
- [ ] Education.test.ts
- [ ] WorkExperience.test.ts
- [ ] Resume.test.ts
- [ ] candidateService.test.ts (completar)
- [ ] fileUploadService.test.ts
- [ ] candidateController.test.ts (completar)
- [ ] candidateRoutes.test.ts
- [ ] Tests de integración API

### Frontend
- [ ] candidateService.test.js/ts
- [ ] AddCandidateForm.test.js/tsx
- [ ] FileUploader.test.js/tsx
- [ ] RecruiterDashboard.test.js/tsx
- [ ] Tests de integración de componentes

### Configuración
- [x] Jest config backend verificado ✅
- [x] Jest config frontend creado/verificado ✅
- [x] Mocks de Prisma configurados ✅ (`backend/src/__mocks__/@prisma/client.ts`)
- [x] Setup de base de datos de test ✅ (`backend/src/__tests__/helpers/testHelpers.ts`)
- [x] Setup de tests frontend ✅ (`frontend/src/setupTests.ts`)
- [x] Mocks de archivos estáticos ✅ (`frontend/__mocks__/fileMock.js`)

---

## 🐛 Manejo de Errores en Tests

### Errores Comunes y Soluciones

1. **Prisma Client no mockeado:**
   - ✅ Crear mock de @prisma/client en `backend/src/__mocks__/@prisma/client.ts`
   - Usar jest.mock() en cada test file que use Prisma

2. **Tests asíncronos no esperados:**
   - Asegurar uso de async/await
   - Usar done() callback cuando sea necesario

3. **Mocks no reseteados:**
   - Usar beforeEach/afterEach con jest.clearAllMocks()
   - Resetear mocks de Prisma entre tests

4. **Tests de React no renderizan:**
   - Verificar configuración de Jest para React
   - Asegurar que @testing-library/react esté correctamente importado

5. **Llamadas HTTP no mockeadas:**
   - ✅ Mockear fetch/axios en todos los tests de frontend
   - Usar jest.mock() para servicios HTTP

6. **Base de datos no limpia entre tests:**
   - Implementar cleanup en afterEach para tests de integración
   - Usar transacciones o truncate para limpiar datos

---

## 📚 Referencias y Buenas Prácticas

### Principios TDD
1. **Red:** Escribir test que falle
2. **Green:** Escribir código mínimo para pasar
3. **Refactor:** Mejorar código manteniendo tests verdes

### Convenciones de Nombrado
- Archivos de test: `*.test.ts` o `*.test.tsx`
- Describe blocks: Nombre del componente/función
- Test cases: "should [acción esperada]"

### Estructura de Tests
```typescript
describe('Component/Service Name', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Cleanup
  })

  describe('Method/Feature', () => {
    it('should [expected behavior]', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

---

## ✅ Decisiones de Implementación

1. **Base de datos de test:**
   - ✅ Usamos PostgreSQL (mismo proyecto, no entorno separado)
   - Los tests de integración usarán la misma base de datos con limpieza entre tests

2. **Cobertura de código:**
   - ✅ Usar cobertura integrada de Jest (`npm run test -- --coverage`)
   - Sin umbral mínimo estricto, pero objetivo del 80%+ en código crítico

3. **Tests E2E:**
   - ✅ Solo unit e integration tests (no E2E con Cypress/Playwright)

4. **Mocks y Stubs:**
   - ✅ Mocks completos para todas las dependencias externas
   - ✅ Llamadas HTTP mockeadas en tests de frontend (fetch/axios)

5. **CI/CD:**
   - ✅ Tests se ejecutan manualmente con `npm run test`
   - No requiere configuración adicional de CI

6. **Prioridades:**
   - ✅ No hay funcionalidades críticas, implementación equilibrada

---

## 📝 Notas Finales

- Este plan es un documento vivo y debe actualizarse conforme se avance
- Priorizar tests de funcionalidades críticas primero
- Mantener tests simples y legibles
- Refactorizar tests cuando sea necesario
- Documentar decisiones importantes en este archivo

---

**Última actualización:** [Fecha de creación]
**Versión:** 1.0

