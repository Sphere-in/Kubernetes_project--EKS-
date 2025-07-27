# variables.tf
# This file defines the variables used in our configuration.
# Using variables makes the configuration reusable and easier to customize.

variable "aws_region" {
  description = "The AWS region to deploy the resources in."
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "The name for the EKS cluster."
  type        = string
  default     = "my-eks-cluster"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "The EC2 instance type for the worker nodes."
  type        = string
  default     = "t2.micro"
}

variable "desired_capacity" {
  description = "The desired number of worker nodes."
  type        = number
  default     = 2
}

variable "max_size" {
  description = "The maximum number of worker nodes."
  type        = number
  default     = 3
}

variable "min_size" {
  description = "The minimum number of worker nodes."
  type        = number
  default     = 1
}
