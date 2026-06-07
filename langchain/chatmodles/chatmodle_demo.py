from langchain_ollama import OllamaLLM
from dotenv import load_dotenv


load_dotenv()
chatmodel = OllamaLLM(model="llama2")
result = chatmodel.invoke("what is the RAG ?")
print(result)