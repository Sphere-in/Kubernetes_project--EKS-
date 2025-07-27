# outputs.tf
# This file defines the outputs of our Terraform configuration.
# Outputs are useful for retrieving information about the created resources.

output "cluster_name" {
  description = "The name of the EKS cluster."
  value       = aws_eks_cluster.eks_cluster.name
}

output "cluster_endpoint" {
  description = "The endpoint for your EKS Kubernetes API server."
  value       = aws_eks_cluster.eks_cluster.endpoint
}

output "cluster_ca_certificate" {
  description = "The certificate authority data for the EKS cluster."
  value       = aws_eks_cluster.eks_cluster.certificate_authority[0].data
  sensitive   = true
}

output "configure_kubectl" {
  description = "Command to configure kubectl for the EKS cluster."
  value = "aws eks --region ${var.aws_region} update-kubeconfig --name ${aws_eks_cluster.eks_cluster.name}"
}
