output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Public API endpoint for Gateway"
}

output "frontend_url" {
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
  description = "Public URL for the React frontend (S3 Static Website)"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 Bucket Name for uploading frontend build"
}

output "ecr_repository_urls" {
  value = {
    for service, repo in aws_ecr_repository.repo : service => repo.repository_url
  }
  description = "ECR Repository URLs for container image uploads"
}
