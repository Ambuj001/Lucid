from sqlalchemy import true
from langchain_groq import ChatGroq
from dotenv import load_dotenv


load_dotenv()
model = ChatGroq(model="llama-3.1-8b-instant")

while true:
    user_input = input("You :")
    if user_input == "exit":
        break
    result = model.invoke(user_input)
    print( "AI :",result.content) 