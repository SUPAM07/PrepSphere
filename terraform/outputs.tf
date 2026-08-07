output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Public API endpoint for Gateway"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "Frontend application URL"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront Distribution ID for cache invalidations"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 Bucket Name for uploading frontend build"
}

output "ecr_repository_urls" {
  value = {
    for service, repo in data.aws_ecr_repository.repo : service => repo.repository_url
  }
  description = "ECR Repository URLs for container image uploads"
}
