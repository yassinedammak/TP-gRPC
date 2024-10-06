const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf file
const packageDef = protoLoader.loadSync("helloworld.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const helloWorldPackage = grpcObject.HelloWorld;

// Create the gRPC client
const client = new helloWorldPackage('localhost:50051', grpc.credentials.createInsecure());

function startStreaming(name, language) {
    console.log(`Starting streaming for ${name} in language: ${language}`);

    // Create the request
    const request = { name: name, language: language };

    // Initiate the server-side streaming
    const call = client.SayHelloStream(request);

    // Handle the streaming responses
    call.on('data', function(response) {
        console.log('Received message:', response.message);
    });

    // Handle the end of the stream (when the server stops streaming)
    call.on('end', function() {
        console.log('Stream ended.');
    });

    // Handle any errors in the stream
    call.on('error', function(e) {
        console.error('Error:', e);
    });

    // Handle status messages from the server
    call.on('status', function(status) {
        console.log('Status:', status);
    });

    // Keep the process alive (daemon-like behavior)
    process.stdin.resume();
}

// Prompt user for name and language
function askUserDetails() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Enter your name: ', (name) => {
        readline.question('Choose your language (en, fr, ar): ', (language) => {
            readline.close();
            startStreaming(name, language);
        });
    });
}

// Start the client by asking for user details
askUserDetails();
