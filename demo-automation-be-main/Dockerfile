# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your application’s code
COPY . .

# Expose the port your app is running on (default for Node.js apps is 3000)
EXPOSE 2000

# Run the app
CMD ["npm", "start"]