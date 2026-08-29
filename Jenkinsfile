// =============================================================================
// Veltrix Jenkinsfile — Declarative CI/CD Pipeline (7 Stages)
// Author: Aayush | Module 2: Jenkins Pipeline & SonarQube Gate
// =============================================================================

pipeline {
    agent any

    environment {
        REGISTRY = "veltrix-ecr-registry"
        APP_NAME = "veltrix"
        BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        SONAR_TOKEN = credentials('sonar-auth-token')
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
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQubeServer') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=veltrix-app"
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
                sh "docker build -t ${REGISTRY}/veltrix-backend:${BUILD_TAG} ./backend"
                sh "docker build -t ${REGISTRY}/veltrix-frontend:${BUILD_TAG} ./frontend/vite-project"
            }
        }

        stage('6. Push Images to Amazon ECR') {
            steps {
                sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${REGISTRY}"
                sh "docker push ${REGISTRY}/veltrix-backend:${BUILD_TAG}"
                sh "docker push ${REGISTRY}/veltrix-frontend:${BUILD_TAG}"
            }
        }

        stage('7. Deploy to Kubernetes (Green Namespace)') {
            steps {
                sh "kubectl apply -f infrastructure/k8s/namespace-green.yaml"
                sh "kubectl apply -f infrastructure/k8s/deployment-green.yaml"
                sh "kubectl patch svc veltrix-service -p '{\"spec\":{\"selector\":{\"env\":\"green\"}}}'"
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
