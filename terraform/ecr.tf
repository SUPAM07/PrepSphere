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
  for_each = toset(local.services)
  name     = each.key

  force_delete = true
}
