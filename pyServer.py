import grpc
from concurrent import futures
import time
import helloworld_pb2
import helloworld_pb2_grpc

class HelloWorldServicer(helloworld_pb2_grpc.HelloWorldServicer):
    def SayHelloStream(self, request, context):
        if request.language == "fr":
            message = f"Bonjour {request.name}!"
        elif request.language == "ar": 
            message = f"مرحبا {request.name}!"
        else:
            message = f"Hello {request.name}!"

        # Stream the message continuously until the server is manually stopped
        counter = 1
        while True:
            yield helloworld_pb2.HelloReply(message=f"{message} - Message {counter}")
            time.sleep(1)  # Wait for 1 second before sending the next message
            counter += 1
            
            # Optionally, check if the client has cancelled the stream
            if context.is_active() is False:
                print("Client disconnected.")
                break

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    helloworld_pb2_grpc.add_HelloWorldServicer_to_server(HelloWorldServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server is running...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
