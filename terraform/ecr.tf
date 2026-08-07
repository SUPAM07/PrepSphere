# ECR Repositories for Microservices & Gateway
locals {
  services = [
    "gateway",
    "auth-service",
    "billing-service",
    "interview-service",
    "resume-service",
    "roadmap-service"
  ]
}

resource "aws_ecr_repository" "repo" {
  for_each             = toset(local.services)
  name                 = "${var.project_name}-${each.key}-${var.environment}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-${each.key}-ecr-${var.environment}"
    Environment = var.environment
  }
}
