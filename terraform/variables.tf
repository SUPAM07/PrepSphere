variable "aws_region" {
  type        = string
  description = "AWS Region to deploy resource into"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Project name tag for tagging and naming resources"
  default     = "prepsphere"
}

variable "environment" {
  type        = string
  description = "Environment stage (dev, staging, production)"
  default     = "production"
}

# Environment secrets for Task Definitions
variable "mongodb_url" {
  type        = string
  description = "MongoDB connection URL"
  sensitive   = true
}

variable "postgres_url" {
  type        = string
  description = "Postgres connection URL"
  sensitive   = true
}

variable "groq_api_key" {
  type        = string
  description = "Groq API key for LLM agents"
  sensitive   = true
}

variable "razorpay_key_id" {
  type        = string
  description = "Razorpay key ID for payment service"
  sensitive   = true
}

variable "razorpay_key_secret" {
  type        = string
  description = "Razorpay key secret for payment service"
  sensitive   = true
}

variable "razorpay_webhook_secret" {
  type        = string
  description = "Razorpay webhook secret"
  sensitive   = true
}
