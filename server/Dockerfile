# Use an official Node runtime as a parent image
FROM node:16.14.2

# Set the working directory in the container
WORKDIR /usr/src/app

# Create a non-root user and give access to working dir
RUN useradd -m myuser && \
    chown -R myuser /usr/src/app && \
    chmod 755 /usr/src/app

# Temporarily switch to root user to install dependencies
USER root

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Change the ownership of installed files back to myuser
RUN chown -R myuser:myuser /usr/src/app

# Switch back to non-root user
USER myuser

# Bundle app source
COPY --chown=myuser:myuser . .

# Your start script
CMD [ "npm", "start" ]
