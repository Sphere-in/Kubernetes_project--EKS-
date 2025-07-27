# main.tf
# This is the main entry point for our Terraform configuration.
# It specifies the required providers and their versions.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}
