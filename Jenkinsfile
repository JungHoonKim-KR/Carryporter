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
                        // 병합 커밋도 감지할 수 있도록 git diff-tree 사용
                        changes = sh(
                            script: "git diff-tree --no-commit-id --name-only -r HEAD || git diff --name-only HEAD~1 HEAD",
                            returnStdout: true
                        ).trim().split('\n')
                    } catch (Exception e) {
                        echo "First commit or unable to get diff, proceeding with build"
                        changes = ['backend/']
                    }

                    echo "Changed files: ${changes}"

                    def jenkinsfileChanged = changes.any { it.contains('Jenkinsfile') }
                    def backendChanged = changes.any { it.startsWith('backend/') }
                    // frontend/ 하위의 모든 변경 감지 (nginx/ 제외)
                    def frontendCodeChanged = changes.any { it.startsWith('frontend/') && !it.startsWith('frontend/nginx/') }
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
                dir('backend') {
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
                dir('backend') {
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
        stage('Build & Deploy Frontend (Blue-Green)') {
            when {
                expression { env.BUILD_FRONTEND == 'true' }
            }
            steps {
                sh '''
                    set -e
                    echo "=== Frontend Blue-Green Deployment ==="

                    # 디렉토리 초기화 (최초 실행 시)
                    mkdir -p /home/ubuntu/frontend/dist-blue
                    mkdir -p /home/ubuntu/frontend/dist-green

                    # 현재 활성 색상 확인 (없으면 blue가 기본)
                    if [ -f /home/ubuntu/frontend/active_color ]; then
                        CURRENT_COLOR=$(cat /home/ubuntu/frontend/active_color)
                    else
                        CURRENT_COLOR="blue"
                        echo "blue" > /home/ubuntu/frontend/active_color
                    fi

                    # 배포 대상 색상 결정
                    if [ "$CURRENT_COLOR" = "blue" ]; then
                        TARGET_COLOR="green"
                    else
                        TARGET_COLOR="blue"
                    fi

                    echo "Current: $CURRENT_COLOR -> Target: $TARGET_COLOR"

                    # 1. React 빌드
                    echo "Building React application..."
                    docker build --no-cache -t frontend-builder -f frontend/nginx/Dockerfile .

                    # 2. 빌드 결과물을 대상 디렉토리에 복사
                    echo "Copying build output to dist-$TARGET_COLOR..."
                    docker run --rm -v /home/ubuntu/frontend/dist-$TARGET_COLOR:/output frontend-builder sh -c "cp -r /tmp/dist/* /output/"

                    # 3. nginx.conf의 root 경로 변경
                    echo "Switching nginx to $TARGET_COLOR..."
                    sed -i "s|/home/ubuntu/frontend/dist-$CURRENT_COLOR|/home/ubuntu/frontend/dist-$TARGET_COLOR|g" /home/ubuntu/frontend/nginx.conf

                    # 4. nginx reload (무중단)
                    echo "Reloading nginx..."
                    docker exec ${NGINX_CONTAINER} nginx -s reload

                    # 5. 활성 색상 업데이트
                    echo "$TARGET_COLOR" > /home/ubuntu/frontend/active_color

                    echo "=== Frontend deployed to $TARGET_COLOR (zero downtime) ==="
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
                    echo "Updating Nginx config..."

                    # nginx.conf 복사
                    cp frontend/nginx/default.conf /home/ubuntu/frontend/nginx.conf

                    # 현재 활성 색상으로 경로 설정
                    if [ -f /home/ubuntu/frontend/active_color ]; then
                        CURRENT_COLOR=$(cat /home/ubuntu/frontend/active_color)
                    else
                        CURRENT_COLOR="blue"
                    fi

                    sed -i "s|/home/ubuntu/frontend/dist-blue|/home/ubuntu/frontend/dist-$CURRENT_COLOR|g" /home/ubuntu/frontend/nginx.conf

                    # nginx reload
                    docker exec ${NGINX_CONTAINER} nginx -s reload

                    echo "Nginx config updated"
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