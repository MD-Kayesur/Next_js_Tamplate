# PowerShell script to build and push Docker image to Docker Hub
# Docker Hub username
$DOCKER_USERNAME = "imranwebstudio"
$IMAGE_NAME = "great2d-admin-dashboard"
$FULL_IMAGE_NAME = "${DOCKER_USERNAME}/${IMAGE_NAME}"

Write-Host "Building Docker image..." -ForegroundColor Blue
docker build -t ${FULL_IMAGE_NAME}:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    Write-Host "Tagging image..." -ForegroundColor Blue
    docker tag ${FULL_IMAGE_NAME}:latest ${FULL_IMAGE_NAME}:latest
    
    Write-Host "Pushing to Docker Hub..." -ForegroundColor Blue
    docker push ${FULL_IMAGE_NAME}:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully pushed to Docker Hub!" -ForegroundColor Green
        Write-Host "Image: ${FULL_IMAGE_NAME}:latest" -ForegroundColor Green
    } else {
        Write-Host "Failed to push to Docker Hub. Make sure you're logged in with: docker login" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

