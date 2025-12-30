#!/bin/bash

# Docker Hub username
DOCKER_USERNAME="imranwebstudio"
IMAGE_NAME="great2d-admin-dashboard"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building Docker image...${NC}"
docker build -t ${FULL_IMAGE_NAME}:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
    
    echo -e "${BLUE}Tagging image...${NC}"
    docker tag ${FULL_IMAGE_NAME}:latest ${FULL_IMAGE_NAME}:latest
    
    echo -e "${BLUE}Pushing to Docker Hub...${NC}"
    docker push ${FULL_IMAGE_NAME}:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully pushed to Docker Hub!${NC}"
        echo -e "${GREEN}Image: ${FULL_IMAGE_NAME}:latest${NC}"
    else
        echo -e "${RED}Failed to push to Docker Hub. Make sure you're logged in with: docker login${NC}"
        exit 1
    fi
else
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

