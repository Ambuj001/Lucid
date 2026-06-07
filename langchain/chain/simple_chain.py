from langchain_core.runnables import chain
from langchain_groq import ChatGroq
from dotenv import load_dotenv

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

model = ChatGroq(model="llama-3.1-8b-instant")

prompt = ChatPromptTemplate.from_template("Generate 5 interesting facts about {topic}")

parser = StrOutputParser()

chain = prompt | model | parser 

result = chain.invoke({
    'topic': 'cricket'
})
print(result)

chain.get_graph().print_ascii()