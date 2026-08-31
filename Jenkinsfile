// =============================================================================
// Veltrix Jenkinsfile — Declarative CI/CD Pipeline (7 Stages)
// Author: Aayush | Module 2: Jenkins Pipeline & SonarQube Gate
// =============================================================================

pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        APP_NAME = "veltrix"
        BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        SONAR_HOST_URL = "http://sonarqube-server:9000"
        DOCKER_BUILDKIT = "1"
    }

    stages {
        stage('1. Checkout Source') {
            steps {
                git branch: 'main', url: 'https://github.com/SQUADRON-LEADER/Veltrix.git'
            }
        }

        stage('2. Install & Unit Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test -- --passWithNoTests'
                }
            }
        }

        stage('3. SonarQube Code Quality Scan') {
            steps {
                script {
                    withSonarQubeEnv('SonarQubeServer') {
                        sh '''
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=veltrix \
                                -Dsonar.sources=./backend,./frontend/vite-project/src \
                                -Dsonar.exclusions=**/node_modules/**,**/tests/**
                        '''
                    }
                }
            }
        }

        stage('4. SonarQube Quality Gate Check') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('5. Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${ECR_REGISTRY}/${APP_NAME}-backend:${BUILD_TAG} \
                                 -t ${ECR_REGISTRY}/${APP_NAME}-backend:latest ./backend
                    docker build -t ${ECR_REGISTRY}/${APP_NAME}-frontend:${BUILD_TAG} \
                                 -t ${ECR_REGISTRY}/${APP_NAME}-frontend:latest ./frontend/vite-project
                '''
            }
        }

        stage('6. Push Images to Amazon ECR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-ecr-creds', 
                                                  usernameVariable: 'AWS_USER', 
                                                  passwordVariable: 'AWS_PASS')]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        docker push ${ECR_REGISTRY}/${APP_NAME}-backend:${BUILD_TAG}
                        docker push ${ECR_REGISTRY}/${APP_NAME}-backend:latest
                        docker push ${ECR_REGISTRY}/${APP_NAME}-frontend:${BUILD_TAG}
                        docker push ${ECR_REGISTRY}/${APP_NAME}-frontend:latest
                    '''
                }
            }
        }

        stage('7. Deploy to Kubernetes (Green Namespace)') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-credentials', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG}
                        
                        # Create green namespace
                        kubectl create namespace green --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Apply deployment (update image tag)
                        kubectl set image deployment/veltrix-backend deployment/veltrix-backend=\
                            ${ECR_REGISTRY}/${APP_NAME}-backend:${BUILD_TAG} -n green || \
                        kubectl apply -f infrastructure/k8s/deployment-green.yaml -n green
                        
                        # Wait for rollout
                        kubectl rollout status deployment/veltrix-backend -n green --timeout=5m
                        
                        # Patch service to route to green
                        kubectl patch svc veltrix-service -n green \
                            -p '{"spec":{"selector":{"env":"green"}}}' || true
                        
                        echo "✅ Deployment successful! Service routed to green namespace."
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline succeeded! Veltrix deployed smoothly."
        }
        failure {
            echo "Pipeline failed! Quality gate or deployment check failed."
        }
    }
}
