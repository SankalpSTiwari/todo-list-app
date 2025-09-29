# Main Dockerfile - serves the todo app with nginx
FROM nginx:alpine

# Copy the app files to nginx html directory
COPY app.js /usr/share/nginx/html/
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Copy nginx configuration from docker directory
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]