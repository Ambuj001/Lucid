from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

# Load environment variables se API Key import karega
load_dotenv()

# Groq model initialize karna
# Yahan aap 'llama-3.1-8b-instant' ya 'mixtral-8x7b-32768' model use kar sakte hain
model = ChatGroq(model="llama-3.1-8b-instant")

# Model se sawal poochna
result = model.invoke("now who is the director of IIT Patna ?")
print(result.content)
