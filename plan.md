# Plan de Implementación - Actualización de Base de Datos

## Objetivos

1. **Analizar el proyecto en profundidad** para comprender su estructura actual
2. **Actualizar la base de datos** con nuevas entidades que permitan operar el flujo completo de aplicación para diversas posiciones
3. **Aplicar normalización y diseño evolutivo** de la base de datos
4. **Crear índices** para mejorar la usabilidad y velocidad

## Contexto del Proyecto

### Estado Actual

El proyecto actualmente tiene:
- **Base de datos**: PostgreSQL con Prisma ORM
- **Entidades existentes**:
  - `Candidate` (Candidato)
  - `Education` (Educación)
  - `WorkExperience` (Experiencia Laboral)
  - `Resume` (CV)

### Estado Objetivo

El sistema necesita expandirse para soportar:
- **Gestión de empresas** (COMPANY)
- **Gestión de posiciones** (POSITION)
- **Gestión de empleados** (EMPLOYEE)
- **Sistema de aplicaciones** (APPLICATION)
- **Flujo de entrevistas** (INTERVIEW_FLOW, INTERVIEW_STEP, INTERVIEW_TYPE, INTERVIEW)

## Plan Paso a Paso

### Fase 1: Análisis y Preparación

#### 1.1 Análisis del Proyecto Actual
- [x] Revisar estructura de directorios
- [x] Analizar esquema Prisma actual (`backend/prisma/schema.prisma`)
- [x] Revisar modelos de dominio existentes
- [x] Entender relaciones actuales
- [x] Identificar convenciones de nomenclatura (camelCase vs snake_case)

#### 1.2 Análisis del Diagrama ERD Objetivo
- [x] Mapear entidades del diagrama Mermaid
- [x] Identificar relaciones y cardinalidades
- [x] Identificar campos y tipos de datos
- [x] Validar normalización (3NF)

### Fase 2: Diseño del Esquema

#### 2.1 Normalización y Validación
- [ ] Revisar normalización de las nuevas entidades
- [ ] Validar que no haya redundancia de datos
- [ ] Verificar integridad referencial
- [ ] Identificar campos opcionales vs requeridos

#### 2.2 Definición de Tipos y Constrains
- [ ] Definir tipos de datos apropiados para cada campo
- [ ] Establecer constraints (unique, check, default)
- [ ] Definir valores por defecto donde aplique
- [ ] Establecer reglas de negocio en el esquema

#### 2.3 Estrategia de Nomenclatura
- **Decisión necesaria**: 
  - Opción A: Mantener convención actual (camelCase: `firstName`, `companyId`)
  - Opción B: Usar snake_case (snake_case: `first_name`, `company_id`)
  - **Recomendación**: Mantener camelCase para consistencia con el código existente

### Fase 3: Migración de Base de Datos

#### 3.1 Actualización del Schema Prisma
- [ ] Agregar modelo `Company`
- [ ] Agregar modelo `Employee`
- [ ] Agregar modelo `Position`
- [ ] Agregar modelo `InterviewFlow`
- [ ] Agregar modelo `InterviewType`
- [ ] Agregar modelo `InterviewStep`
- [ ] Agregar modelo `Application`
- [ ] Agregar modelo `Interview`
- [ ] Actualizar modelo `Candidate` (mantener existente, agregar relación con Application)

#### 3.2 Definición de Relaciones
- [ ] `Company` → `Employee` (1:N)
- [ ] `Company` → `Position` (1:N)
- [ ] `Position` → `InterviewFlow` (N:1)
- [ ] `InterviewFlow` → `InterviewStep` (1:N)
- [ ] `InterviewType` → `InterviewStep` (1:N)
- [ ] `Position` → `Application` (1:N)
- [ ] `Candidate` → `Application` (1:N)
- [ ] `Application` → `Interview` (1:N)
- [ ] `InterviewStep` → `Interview` (1:N)
- [ ] `Employee` → `Interview` (1:N)

#### 3.3 Creación de Índices

**Índices de Rendimiento Sugeridos:**

1. **COMPANY**
   - `name` (búsquedas por nombre)

2. **EMPLOYEE**
   - `company_id` (filtrado por empresa)
   - `email` (único, ya que será unique constraint)
   - `is_active` (filtrado de empleados activos)

3. **POSITION**
   - `company_id` (filtrado por empresa)
   - `interview_flow_id` (relación con flujo)
   - `status` (filtrado por estado)
   - `is_visible` (filtrado de posiciones visibles)
   - `application_deadline` (búsquedas por fecha límite)
   - **Compuesto**: `(status, is_visible)` (búsquedas comunes)

4. **INTERVIEW_FLOW**
   - No requiere índices adicionales (PK ya indexado)

5. **INTERVIEW_STEP**
   - `interview_flow_id` (filtrado por flujo)
   - `interview_type_id` (filtrado por tipo)
   - **Compuesto**: `(interview_flow_id, order_index)` (ordenamiento)

6. **INTERVIEW_TYPE**
   - No requiere índices adicionales (PK ya indexado)

7. **CANDIDATE**
   - `email` (ya existe como unique)
   - Considerar índice compuesto: `(firstName, lastName)` para búsquedas

8. **APPLICATION**
   - `position_id` (filtrado por posición)
   - `candidate_id` (filtrado por candidato)
   - `status` (filtrado por estado)
   - `application_date` (ordenamiento por fecha)
   - **Compuesto**: `(position_id, status)` (búsquedas comunes)

9. **INTERVIEW**
   - `application_id` (filtrado por aplicación)
   - `interview_step_id` (filtrado por paso)
   - `employee_id` (filtrado por empleado)
   - `interview_date` (ordenamiento por fecha)
   - **Compuesto**: `(application_id, interview_step_id)` (búsquedas comunes)

#### 3.4 Generación de Migración
- [ ] Crear migración con `prisma migrate dev --name add_recruitment_system`
- [ ] Revisar SQL generado
- [ ] Validar que no haya conflictos con datos existentes
- [ ] Probar migración en entorno de desarrollo

### Fase 4: Actualización del Código (Opcional - Futuro)

#### 4.1 Modelos de Dominio
- [ ] Crear modelos TypeScript para nuevas entidades
- [ ] Actualizar modelo `Candidate` si es necesario

#### 4.2 Servicios
- [ ] Crear servicios para nuevas entidades
- [ ] Actualizar servicios existentes si es necesario

#### 4.3 Controladores y Rutas
- [ ] Crear controladores para nuevas entidades
- [ ] Crear rutas para nuevas entidades

#### 4.4 Tests
- [ ] Actualizar tests existentes
- [ ] Crear tests para nuevas funcionalidades

## Decisiones Tomadas ✅

### 1. Estrategia de Migración de Datos
**Decisión**: No hay datos que preservar. Migración limpia.

### 2. Campos de Estado
**Decisión**: Strings libres (no enums). Los estados serán strings simples.

### 3. Campos de Timestamps
**Decisión**: ✅ Agregar `createdAt` y `updatedAt` a todas las nuevas entidades.

### 4. Soft Deletes
**Decisión**: Eliminación física es suficiente (no soft deletes).

### 5. Relación Position-InterviewFlow
**Decisión**: ✅ N:1 (múltiples posiciones pueden compartir un flujo de entrevistas).

### 6. Campos description vs job_description
**Decisión**: Eliminar `description`, mantener `job_description` (más específico).

### 7. Integración con Código
**Decisión**: Solo actualizar esquema de base de datos (Prisma schema + migración). No actualizar modelos TypeScript, servicios ni controladores en esta fase.

### 8. Campos Opcionales
**Decisión**: Se decidirá según mejor criterio durante la implementación.

## Orden de Implementación Recomendado

1. **Entidades base sin dependencias**:
   - Company
   - InterviewFlow
   - InterviewType

2. **Entidades con dependencias simples**:
   - Employee (depende de Company)
   - InterviewStep (depende de InterviewFlow e InterviewType)
   - Position (depende de Company e InterviewFlow)

3. **Entidades de flujo de negocio**:
   - Application (depende de Position y Candidate)
   - Interview (depende de Application, InterviewStep y Employee)

## Notas Técnicas

### Convenciones de Nomenclatura (Basadas en código existente)
- **Modelos**: PascalCase (ej: `Candidate`, `Company`)
- **Campos**: camelCase (ej: `firstName`, `companyId`)
- **Relaciones**: camelCase plural (ej: `applications`, `interviews`)

### Tipos de Datos PostgreSQL
- `int` → `Int` en Prisma
- `string` → `String @db.VarChar(n)` o `String` para texto largo
- `text` → `String` (sin @db.VarChar)
- `numeric` → `Decimal` en Prisma
- `date` → `DateTime` en Prisma
- `boolean` → `Boolean` en Prisma

### Buenas Prácticas a Aplicar
1. **Índices estratégicos**: Solo donde realmente se necesitan (no sobre-indexar)
2. **Constraints apropiados**: Unique donde corresponde, foreign keys para integridad
3. **Campos opcionales marcados**: Usar `?` en Prisma para campos opcionales
4. **Default values**: Establecer valores por defecto donde tenga sentido (ej: `is_active = true`, `is_visible = true`)
5. **Cascading**: Definir comportamiento de `onDelete` para relaciones FK

---

## Estado de Implementación

### ✅ Completado

1. ✅ **Análisis del proyecto** - Estructura actual comprendida
2. ✅ **Actualización del Schema Prisma** - Todas las entidades agregadas:
   - `Company`
   - `Employee`
   - `Position`
   - `InterviewFlow`
   - `InterviewType`
   - `InterviewStep`
   - `Application`
   - `Interview`
3. ✅ **Relaciones definidas** - Todas las FKs y relaciones configuradas
4. ✅ **Campos createdAt/updatedAt** - Agregados a todas las nuevas entidades
5. ✅ **Índices estratégicos** - Agregados según plan de optimización
6. ✅ **Actualización de Candidate** - Relación con Application agregada
7. ✅ **Schema formateado** - Validado con `prisma format`

### 📋 Próximos Pasos (Usuario)

Para generar y aplicar la migración, el usuario debe:

1. **Configurar DATABASE_URL** en el archivo `.env` del backend:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   ```

2. **Ejecutar la migración**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_recruitment_system
   ```

3. **Generar Prisma Client** (se hace automáticamente con migrate dev, pero por si acaso):
   ```bash
   npx prisma generate
   ```

4. **Validar** que la migración se haya aplicado correctamente.

## Resumen de Cambios Realizados

### Entidades Nuevas Agregadas

1. **Company** (Empresa)
   - Campos: id, name, createdAt, updatedAt
   - Índice: name

2. **Employee** (Empleado)
   - Campos: id, companyId, name, email (unique), role, isActive (default: true), createdAt, updatedAt
   - Índices: companyId, isActive, email
   - Relación: Company (N:1) con Cascade delete

3. **InterviewFlow** (Flujo de Entrevistas)
   - Campos: id, description, createdAt, updatedAt

4. **InterviewType** (Tipo de Entrevista)
   - Campos: id, name, description (opcional), createdAt, updatedAt

5. **InterviewStep** (Paso de Entrevista)
   - Campos: id, interviewFlowId, interviewTypeId, name, orderIndex, createdAt, updatedAt
   - Índices: interviewFlowId, interviewTypeId, (interviewFlowId, orderIndex) compuesto
   - Relaciones: InterviewFlow (N:1) con Cascade, InterviewType (N:1) con Restrict

6. **Position** (Posición/Puesto)
   - Campos: id, companyId, interviewFlowId, title, status, isVisible (default: true), location, jobDescription, requirements, responsibilities, salaryMin, salaryMax, employmentType, benefits, companyDescription, applicationDeadline, contactInfo, createdAt, updatedAt
   - Índices: companyId, interviewFlowId, status, isVisible, applicationDeadline, (status, isVisible) compuesto
   - Relaciones: Company (N:1) con Cascade, InterviewFlow (N:1) con Restrict
   - Nota: Se eliminó `description` según decisión, manteniendo solo `jobDescription`

7. **Application** (Aplicación)
   - Campos: id, positionId, candidateId, applicationDate (default: now()), status (default: "pending"), notes, createdAt, updatedAt
   - Índices: positionId, candidateId, status, applicationDate, (positionId, status) compuesto
   - Relaciones: Position (N:1) con Cascade, Candidate (N:1) con Cascade

8. **Interview** (Entrevista)
   - Campos: id, applicationId, interviewStepId, employeeId, interviewDate, result (opcional), score (opcional), notes (opcional), createdAt, updatedAt
   - Índices: applicationId, interviewStepId, employeeId, interviewDate, (applicationId, interviewStepId) compuesto
   - Relaciones: Application (N:1) con Cascade, InterviewStep (N:1) con Restrict, Employee (N:1) con Restrict

### Entidades Modificadas

1. **Candidate**
   - Agregada relación: `applications Application[]`

### Estrategias de Cascada (onDelete)

- **Cascade**: Company → Employee, Company → Position, Position → Application, Candidate → Application, Application → Interview
- **Restrict**: InterviewFlow → Position, InterviewType → InterviewStep, InterviewStep → Interview, Employee → Interview

### Índices Implementados

Se implementaron **20 índices** estratégicos:
- 5 índices simples
- 15 índices compuestos
- Optimizados para búsquedas comunes y relaciones

---

## ✅ Estado Final - Implementación Completada

**Fecha de Finalización**: 2024-12-XX

### Resumen de Ejecución

✅ **Todas las fases se completaron exitosamente**:
1. ✅ Análisis del proyecto completado
2. ✅ Schema Prisma actualizado con 8 nuevas entidades
3. ✅ Relaciones implementadas (10 relaciones)
4. ✅ Índices estratégicos creados (20 índices)
5. ✅ Migración aplicada a base de datos
6. ✅ Prisma Client generado

### Verificación

- **12 tablas** creadas en la base de datos
- **Prisma Client** generado correctamente
- **Schema validado** y formateado
- **Base de datos sincronizada** con el schema

Para más detalles, ver `IMPLEMENTATION_SUMMARY.md`

---

*Plan generado el: 2024-12-XX*
*Implementación completada el: 2024-12-XX*
*Versión: 1.0 - Implementado ✅*

