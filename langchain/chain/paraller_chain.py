from longchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_core.Output_parser import StrOutputParser
from langchain_core.template import PromptTemplate


load_dotenv()
model = ChatGroq(model='llama-3.1-8b-instant')
parser = StrOutputParser()

prompt = PromptTemplate({
    
})