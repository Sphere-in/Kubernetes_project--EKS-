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
        stage('Install AWS Load Balancer Controller') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                ]) {
                    sh '''
                    helm repo add eks https://aws.github.io/eks-charts
                    helm repo update
                    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \\
                    -n kube-system \\
                    --set clusterName=${CLUSTER_NAME} \\
                    --set serviceAccount.create=true \\
                    --set serviceAccount.name=aws-load-balancer-controller \\
                    --set serviceAccount.annotations."eks.amazonaws.com/role-arn"="{ARN_OF_YOUR_IAM_ROLE}"
                    '''
                }
            }
        }


        stage ("Install App"){
            steps {
                 withCredentials([
                     string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                ]){
                    dir ("app"){
                        sh 'helm upgrade --install my-app .'
                    }
                }
            }
        }

    }
}