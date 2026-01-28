pipeline {
    agent any
    
    options {
        skipDefaultCheckout(true)
        timestamps()
    }
    
    environment {
        TARGET_BRANCH = "release"
        DOCKER_NETWORK = "app-network"

        // Backend
        BACKEND_CONTAINER = "backend"
        BACKEND_IMAGE = "spring-boot-app:latest"

        // Frontend (Nginx에 React 정적 파일 내장)
        NGINX_CONTAINER = "nginx"
        NGINX_IMAGE = "nginx-frontend:latest"

        // Infrastructure
        MYSQL_CONTAINER = "mysql"
        REDIS_CONTAINER = "redis"
        MOSQUITTO_CONTAINER = "mosquitto"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Check Branch & Changes') {
            steps {
                script {
                    // 현재 브랜치 확인
                    def branch = env.GIT_BRANCH?.replaceAll('origin/', '') ?: ''

                    if (!branch || branch == 'HEAD') {
                        branch = sh(
                            script: "git branch -r --contains HEAD | grep -o 'origin/[^[:space:]]*' | head -n 1 | sed 's|origin/||'",
                            returnStdout: true
                        ).trim()
                    }

                    echo "Current branch: ${branch}"

                    // release 브랜치가 아니면 스킵
                    if (branch != env.TARGET_BRANCH) {
                        echo "Not on '${env.TARGET_BRANCH}' branch. Skipping deployment."
                        currentBuild.result = 'NOT_BUILT'
                        error("Branch mismatch: expected '${env.TARGET_BRANCH}', got '${branch}'")
                    }

                    // 변경된 파일 목록 확인
                    def changes = []
                    try {
                        changes = sh(
                            script: "git diff --name-only HEAD~1 HEAD || git diff --name-only HEAD",
                            returnStdout: true
                        ).trim().split('\n')
                    } catch (Exception e) {
                        echo "First commit or unable to get diff, proceeding with build"
                        changes = ['backend/']
                    }

                    echo "Changed files: ${changes}"

                    def jenkinsfileChanged = changes.any { it.contains('Jenkinsfile') }
                    def backendChanged = changes.any { it.startsWith('backend/') }
                    def frontendCodeChanged = changes.any { it.startsWith('frontend/sse-client/') }
                    def nginxConfChanged = changes.any { it.startsWith('frontend/nginx/') }

                    // Jenkinsfile이 바뀌면 전체 빌드
                    env.BUILD_BACKEND = (jenkinsfileChanged || backendChanged) ? 'true' : 'false'
                    // React 코드 변경 → React 빌드 + nginx 이미지 재생성
                    env.BUILD_FRONTEND = (jenkinsfileChanged || frontendCodeChanged) ? 'true' : 'false'
                    // nginx 설정만 변경 → nginx 이미지만 재생성 (React 빌드는 Docker 캐시 사용)
                    env.BUILD_NGINX_CONF = (nginxConfChanged) ? 'true' : 'false'

                    if (!jenkinsfileChanged && !backendChanged && !frontendCodeChanged && !nginxConfChanged) {
                        echo "No relevant changes detected. Skipping deployment."
                        currentBuild.result = 'NOT_BUILT'
                        error("No backend, frontend, or Jenkinsfile changes detected")
                    }

                    echo "Build Triggered - Backend: ${env.BUILD_BACKEND}, Frontend: ${env.BUILD_FRONTEND}, Nginx Conf: ${env.BUILD_NGINX_CONF}"
                }
            }
        }

        stage('Ensure Infrastructure') {
            steps {
                script {
                    sh '''
                        set -e
                        echo "Checking Docker network..."
                        docker network inspect ${DOCKER_NETWORK} >/dev/null 2>&1 || docker network create ${DOCKER_NETWORK}

                        echo "Checking infrastructure containers..."
                        if ! docker ps | grep -q ${MYSQL_CONTAINER}; then
                            echo "MySQL not running. Infrastructure must be started manually on the server."
                            echo "Run: cd ~/infra && docker-compose up -d"
                            exit 1
                        else
                            echo "Infrastructure already running"
                        fi
                    '''
                }
            }
        }

        stage('Build Backend (Gradle)') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                dir('backend/carryporter') {
                    sh '''
                        set -e
                        echo "Building Spring Boot application..."
                        chmod +x gradlew
                        ./gradlew clean build -x test
                    '''
                }
            }
        }

        stage('Docker Build & Deploy Backend') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                dir('backend/carryporter') {
                    script {
                        // ✅ 수정됨: Credentials 적용 (Secret file)
                        withCredentials([file(credentialsId: 'backend-env-file', variable: 'SECRET_ENV_PATH')]) {
                            sh '''
                                set -e
                                echo "Building Backend Docker image..."
                                docker build -t ${BACKEND_IMAGE} .

                                echo "Deploying Backend..."
                                docker stop ${BACKEND_CONTAINER} 2>/dev/null || true
                                docker rm ${BACKEND_CONTAINER} 2>/dev/null || true

                                # --env-file 옵션에 젠킨스가 제공한 변수(SECRET_ENV_PATH) 사용
                                docker run -d \
                                    --name ${BACKEND_CONTAINER} \
                                    --network ${DOCKER_NETWORK} \
                                    --restart unless-stopped \
                                    --env-file ${SECRET_ENV_PATH} \
                                    ${BACKEND_IMAGE}

                                sleep 5
                                docker ps | grep ${BACKEND_CONTAINER}
                            '''
                        }
                    }
                }
            }
        }
        stage('Docker Build & Deploy Frontend (React + Nginx)') {
            when {
                expression { env.BUILD_FRONTEND == 'true' }
            }
            steps {
                sh '''
                    set -e
                    echo "Building Nginx + React Docker image (full rebuild)..."
                    docker build --no-cache -t ${NGINX_IMAGE} -f frontend/nginx/Dockerfile .

                    echo "Deploying Nginx..."
                    docker stop ${NGINX_CONTAINER} 2>/dev/null || true
                    docker rm ${NGINX_CONTAINER} 2>/dev/null || true

                    docker run -d \
                        --name ${NGINX_CONTAINER} \
                        --network ${DOCKER_NETWORK} \
                        --restart unless-stopped \
                        -p 8050:80 \
                        ${NGINX_IMAGE}

                    sleep 5
                    docker ps | grep ${NGINX_CONTAINER}
                '''
            }
        }

        stage('Deploy Nginx Config Only') {
            when {
                expression { env.BUILD_NGINX_CONF == 'true' && env.BUILD_FRONTEND != 'true' }
            }
            steps {
                sh '''
                    set -e
                    echo "Updating Nginx config only (React cached)..."
                    docker build -t ${NGINX_IMAGE} -f frontend/nginx/Dockerfile .

                    echo "Deploying Nginx..."
                    docker stop ${NGINX_CONTAINER} 2>/dev/null || true
                    docker rm ${NGINX_CONTAINER} 2>/dev/null || true

                    docker run -d \
                        --name ${NGINX_CONTAINER} \
                        --network ${DOCKER_NETWORK} \
                        --restart unless-stopped \
                        -p 8050:80 \
                        ${NGINX_IMAGE}

                    sleep 5
                    docker ps | grep ${NGINX_CONTAINER}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
        always {
            echo "Pipeline finished."
        }
    }
}