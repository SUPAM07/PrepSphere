# CI/CD Pipeline Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the PrepSphere application, managed entirely via **GitHub Actions**.

## Pipeline Architecture

The pipeline is split into two distinct, sequential workflows to ensure that code quality is strictly validated before any infrastructure or deployment changes occur.

### 1. Continuous Integration (`ci.yml`)
The CI workflow serves as the quality gate. It triggers on any **Pull Request** and on direct pushes to the `main` branch.

**Key Steps:**
- **Dependency Installation**: Runs `npm ci` for both the frontend and backend.
- **Static Analysis**: Executes ESLint (`npm run lint`) to enforce code styling and formatting rules.
- **Type Checking**: Runs TypeScript validation (`npm run typecheck` or `tsc --noEmit`) to catch compile-time errors.
- **Testing**: Executes automated unit and integration tests (`npm test`).
- **Build Verification**: Performs a dry-run build (`npm run build`) to ensure the application compiles successfully for production.

*Note: A pull request cannot be merged unless this CI workflow passes successfully.*

### 2. Continuous Deployment (`deploy.yml`)
The CD workflow handles provisioning infrastructure and rolling out application updates. It triggers automatically only when the `CI` workflow completes successfully on the `main` branch.

**Key Steps:**
- **Immutable Docker Builds**: Backend services are containerized, and their Docker images are tagged with the exact Git commit SHA (`${{ github.event.workflow_run.head_sha }}`) instead of a mutable `latest` tag.
- **Image Registry (ECR)**: The newly built Docker images are pushed to Amazon ECR.
- **Infrastructure as Code (Terraform)**:
  - **Format & Validate**: Terraform configuration is checked for correct formatting and syntax.
  - **Plan & Apply**: Terraform dynamically calculates the dependency graph and applies the infrastructure state (e.g., updating ECS task definitions to use the new Docker image tags).
- **Deployment Verification**:
  - **ECS Wait**: The workflow explicitly pauses to wait for the new ECS containers to reach a `stable` and running state.
  - **Smoke Testing**: Once stable, the pipeline executes an HTTP smoke test against the Application Load Balancer (`/health` endpoint). If this test fails, the deployment is marked as failed.
- **Frontend Deployment**: Once the backend is fully deployed and verified, the React frontend is built and synced to the S3 bucket.

## Rollbacks and Debugging
Because every deployment is strictly tied to a Git commit SHA, rolling back is as simple as reverting the commit on `main` or manually running the CD pipeline against a previously stable Git SHA. The pipeline's step-by-step failure checks prevent a broken application state from silently being reported as a success.
