# Use the official Node.js image from the Docker Hub
FROM node:14

# Install ClamAV
RUN apt-get update && \
    apt-get install -y clamav clamav-daemon && \
    freshclam && \
    rm -rf /var/lib/apt/lists/*

RUN ["mkdir", "/install"]
ADD ["./package.json", "/install"]
WORKDIR /install
RUN npm install --verbose
ENV NODE_PATH=/install/node_modules

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the ClamAV configuration file
COPY clamd.conf /etc/clamav/clamd.conf

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the application runs on
EXPOSE 3000

# Command to run the application
CMD ["bash", "-c", "freshclam && service clamav-daemon start && node server.js"]
