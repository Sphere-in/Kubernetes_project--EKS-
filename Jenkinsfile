pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        CLUSTER_NAME = 'my-eks-cluster'
    }

    stages{

        stage("Checkout") {
            steps{
                git 'https://github.com/Sphere-in/Kubernetes_project--EKS-.git'
            }
        }
        stage ("Creating Infrastructure"){
            steps{
                withCredentials([
                     string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                ]){
                    dir('terraform'){
                        sh 'terraform init'
                        sh 'terraform plan -out=tfplan'
                        sh 'terraform apply -auto-approve tfplan'
                    }
                }
            }
        }

        stage ("Configure Kube Control"){
            steps{
                 withCredentials([
                     string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                 ]) {
                    sh "aws eks --region ${AWS_REGION} update-kubeconfig --name ${CLUSTER_NAME}"
                }
            }
        }

        stage ("Install App"){
            steps {
                dir ("app"){
                    sh 'helm upgrade --install my-app .'
                }
            }
        }

    }
}