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

                        script {
                            def tfOutput = sh(returnStdout: true, script: 'terraform output -json')
                            def parsedOutput = readJSON(text: tfOutput)
                            env.LB_CONTROLLER_ROLE_ARN = parsedOutput.aws_load_balancer_controller_role_arn.value
                        }
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
                    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
                    -n kube-system \
                    --set clusterName=${CLUSTER_NAME} \
                    --set serviceAccount.create=true \
                    --set serviceAccount.name=aws-load-balancer-controller \
                    --set serviceAccount.annotations."eks.amazonaws.com/role-arn"="${LB_CONTROLLER_ROLE_ARN}"
                    '''
                }
            }
        }


        stage ("Build and Push App"){
            steps {
                script {
                    def nextAppRepo = "https://github.com/Sphere-in/Next_app.git"
                    def dockerRepo = "raihansh/nextapp"
                    def newTag = sh(returnStdout: true, script: 'echo ${BUILD_NUMBER}').trim()
                    def imageName = "${dockerRepo}:${newTag}"

                    git url: nextAppRepo
                    
                    withCredentials([
                        string(credentialsId: 'DOCKERHUB_USERNAME', variable: 'DOCKERHUB_USERNAME'),
                        string(credentialsId: 'DOCKERHUB_PASSWORD', variable: 'DOCKERHUB_PASSWORD'),                    
                    ]) {
                        sh "docker login -u ${DOCKERHUB_USERNAME} -p ${DOCKERHUB_PASSWORD}"
                        sh "docker build -t ${imageName} ."
                        sh "docker push ${imageName}"
                    }

                    dir ("app"){
                        sh "helm upgrade --install my-app . --set app.image.tag=${newTag}"
                    }
                }
            }
        }


        stage('Get IPs and Send Email') {
            steps {
                script {
                    def appIngress = sh(returnStdout: true, script: "kubectl get ingress {{ .Release.Name }}-main-ingress -o=jsonpath='{.status.loadBalancer.ingress[0].hostname}'")
                    def grafanaService = sh(returnStdout: true, script: "kubectl get service {{ .Release.Name }}-grafana-service -o=jsonpath='{.status.loadBalancer.ingress[0].hostname}'")
                    
                    def emailBody = "The application ingress hostname is: ${appIngress.trim()}\n" +
                                    "The Grafana service hostname is: ${grafanaService.trim()}"

                    emailext (
                        subject: "EKS Deployment Successful - IP Addresses",
                        body: emailBody,
                        to: 'raihanshaikh109@gmail.com' 
                    )
                }
            }
        }

    }
}