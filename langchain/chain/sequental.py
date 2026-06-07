

 
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
model = ChatGroq(model="llama-3.1-8b-instant")
 
prompt1 =  PromptTemplate(
    template="Gernalte a deteled summary of the given {topic}",
    input_variables=['topic']
)


prompt2 = PromptTemplate(
    template="Genrate a 5 pointer summery from the following text \n {text}",
     input_variables=['text']
)

parser = StrOutputParser()

chain =  prompt1 |model | parser| prompt2 | model |parser

result = chain.invoke(
    {
        'topic': 'cricket',
        'text':'summery of the following text is as under '
         
    }
)


print(result)



chain.get_graph().print_ascii()