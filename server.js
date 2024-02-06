const http = require("http");
const url = require("url");
const fs = require("fs");

http
  .createServer((request, response) => {
    // Parse the request URL
    const parsedURL = url.parse(request.url, true);

    // Get the pathname from the parsed URL
    const pathname = parsedURL.pathname;

    // Timestamps added to log
    fs.appendFile(
      "log.txt",
      "URL: " + request.url + "\nTimestamp: " + new Date() + "\n\n",
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log.");
        }
      }
    );

    // Determine the file path based on the URL
    let filePath;
    if (pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    // Read the HTML file and send the response
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      // Set the response header
      response.writeHead(200, { "Content-Type": "text/html" });

      // Write the HTML data to the response
      response.write(data);

      // End the response with an additional message
      response.end();
    });
  })
  .listen(8080);

console.log("My first Node test server is running on Port 8080.");
