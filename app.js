const http = require("http");
const PORT = 8080;


const requestHandler = function(request, response) {
  console.log('In requestHandler');
  if (request.url === '/') {
    response.end(`Welcome!`);
  }
  if (request.url === '/path') {
  response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
  }
  response.statusCode = 404;
  response.end(`404 Page Not Found`);
};

const server = http.createServer(requestHandler);
console.log('Server created')

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log('Last line (after .listen call)');