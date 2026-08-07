terraform {
  required_version = ">= 1.5.0"
  
  backend "s3" {
    bucket = "prepsphere-terraform-state-366428725217"
    key    = "terraform.tfstate"
    region = "eu-north-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
