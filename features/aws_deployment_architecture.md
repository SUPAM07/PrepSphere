# AWS Deployment Architecture

This document briefly describes the AWS infrastructure and deployment architecture for the PrepSphere application.

## Overview

The application is deployed on Amazon Web Services (AWS) using a modern, containerized, and serverless architecture. The infrastructure is entirely managed as code using **Terraform**.

## Core Components

### 1. Compute & Containers (ECS & ECR)
- **Amazon Elastic Container Registry (ECR)**: Stores the Docker images for all backend microservices (Gateway, Auth, Billing, Interview, Resume, Roadmap).
- **Amazon Elastic Container Service (ECS)**: Runs the containerized backend services using AWS Fargate (serverless compute for containers). ECS ensures high availability and scales the services based on demand.

### 2. Networking (VPC & ALB)
- **Virtual Private Cloud (VPC)**: Provides a secure, isolated private network for the backend services and databases to communicate.
- **Application Load Balancer (ALB)**: Acts as the main entry point for the backend API. It securely routes incoming HTTP traffic to the appropriate ECS tasks (primarily the Gateway service) and handles health checks.

### 3. Frontend Hosting (S3)
- **Amazon Simple Storage Service (S3)**: The compiled React frontend (Vite build) is hosted as a static website directly from an S3 bucket. This provides low-latency, highly available content delivery for the web app without requiring dedicated web servers.

### 4. Infrastructure as Code (Terraform)
- The entire AWS topology is defined in the `terraform/` directory. Deployments are executed by Terraform, which manages state and ensures that the cloud environment strictly matches the defined configuration.

## Deployment Flow
When a new version of the application is deployed:
1. Docker images are pushed to ECR.
2. Terraform updates the ECS task definitions to use the new images.
3. ECS performs a rolling update, launching new containers and draining old ones.
4. The ALB automatically routes traffic to the newly healthy containers.
5. The frontend S3 bucket is updated with the latest compiled assets.
