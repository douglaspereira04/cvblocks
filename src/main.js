var http = require("http");

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Hello World\n');
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

const { Contract } = require('fabric-contract-api');

export class Recruiter extends Contract {
	async CreateRecruiter(ctx, id, name, company) {
        const recruiter= {
            ID: id,
            Name: name,
            Company: company
        };       
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(recruiter)));
    }
}


