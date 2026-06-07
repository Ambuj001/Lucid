import os
from dotenv import load_dotenv

# Print current directory
print(f"Current directory: {os.getcwd()}")

# Load .env file
load_dotenv()

# Check if variables are loaded
token = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")
print(f"Token loaded: {token}")
print(f"Token is None: {token is None}")

if token:
    print(f"Token starts with 'hf_': {token.startswith('hf_')}")
    print(f"Token length: {len(token)}")
