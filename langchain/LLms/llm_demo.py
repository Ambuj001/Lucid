from langchain_ollama import OllamaLLM
from dotenv import load_dotenv

load_dotenv()
llm = OllamaLLM(model='llama2')
result = llm.invoke("what is the captial of India")

print(result)