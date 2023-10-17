// swagger.js

const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bank API",
      version: "1.0.0",
      description: "A simple Express bank API",
    },
    servers: [
      {
        url: "http://localhost:8080",
        utl: "https://banking-app-mit-b252408f3be8.herokuapp.com/",
      },
    ],
  },
  apis: ["./routes/*.js"], // files containing annotations as above
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
