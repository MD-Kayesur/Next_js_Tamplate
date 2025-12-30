# Docker Setup for Great2D Admin Dashboard

This project is dockerized and ready for containerized deployment.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Building the Docker Image

### Using Docker directly:

```bash
# Build the image
docker build -t great2d-admin-dashboard .

# Run the container
docker run -p 3000:3000 great2d-admin-dashboard
```

### Using Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Environment Variables

If you need to set environment variables, you can:

1. **Using Docker run:**
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.example.com great2d-admin-dashboard
   ```

2. **Using Docker Compose:**
   Edit `docker-compose.yml` and add environment variables under the `environment` section:
   ```yaml
   environment:
     - NODE_ENV=production
     - NEXT_PUBLIC_API_URL=https://api.example.com
   ```

## Accessing the Application

Once the container is running, access the application at:
- http://localhost:3000

## Pushing to Docker Hub

The image is configured to be pushed to Docker Hub under the username `imranwebstudio`.

### Prerequisites
1. Make sure you're logged in to Docker Hub:
   ```bash
   docker login
   ```
   Enter your Docker Hub credentials when prompted.

### Build and Push

**Option 1: Using the provided script (Recommended)**

**On Windows (PowerShell):**
```powershell
.\build-and-push.ps1
```

**On Linux/Mac:**
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

**Option 2: Manual commands**

```bash
# Build the image
docker build -t imranwebstudio/great2d-admin-dashboard:latest .

# Push to Docker Hub
docker push imranwebstudio/great2d-admin-dashboard:latest
```

### Pulling the Image

Once pushed, you can pull and run the image from anywhere:
```bash
docker pull imranwebstudio/great2d-admin-dashboard:latest
docker run -p 3000:3000 imranwebstudio/great2d-admin-dashboard:latest
```

Or use docker-compose with the pre-configured image:
```bash
docker-compose pull
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Build and push the image (see above)

2. Deploy to your hosting platform (AWS ECS, Kubernetes, DigitalOcean, etc.) using the image:
   ```
   imranwebstudio/great2d-admin-dashboard:latest
   ```

## Troubleshooting

- **Port already in use:** Change the port mapping in docker-compose.yml or use a different port: `-p 3001:3000`
- **Build fails:** Make sure all dependencies are properly listed in package.json
- **Container exits immediately:** Check logs with `docker logs great2d-admin-dashboard`


