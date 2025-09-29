#!/bin/bash

# Docker build and run script for Todo List App

echo "🐳 Building Docker image for Todo List App..."

# Build the Docker image from root directory
docker build -t todo-list-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    
    echo "🚀 Starting Todo List App container..."
    
    # Run the container
    docker run -d \
        --name todo-list-app \
        -p 3000:80 \
        --restart unless-stopped \
        todo-list-app
    
    if [ $? -eq 0 ]; then
        echo "✅ Todo List App is now running!"
        echo "🌐 Access your app at: http://localhost:3000"
        echo ""
        echo "📋 Useful commands:"
        echo "  • View logs: docker logs todo-list-app"
        echo "  • Stop app: docker stop todo-list-app"
        echo "  • Remove container: docker rm todo-list-app"
        echo "  • Remove image: docker rmi todo-list-app"
    else
        echo "❌ Failed to start container"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image"
    exit 1
fi
