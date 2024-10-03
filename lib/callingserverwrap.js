// lib/callingserverwrap.js
import pkg from 'follow-redirects';
const { https } = pkg; // Destructure https from the default export

export function makeHttpsRequest(method, hostname, path, headers = {}, maxRedirects = 20) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method || 'GET',
      hostname: hostname,
      path: path,
      headers: {
        'Accept': 'application/json',
        ...headers // Merge custom headers if provided
      },
      maxRedirects: maxRedirects
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        let body = Buffer.concat(chunks).toString();
        resolve(body); // Resolve the promise with the response body
      });

      res.on("error", (error) => {
        reject(error); // Reject the promise if there's an error
      });
    });

    req.end();
  });
}
