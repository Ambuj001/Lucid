from langchain_groq import ChatGroq
from dotenv import load_dotenv
import streamlit as st
from langchain_core.prompts import PromptTemplate
import os

load_dotenv()

st.header("Research Tool")
paper_input  = st.selectbox("select Research Paper Name",["Attention Is All You Need","BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding","GPT-3.5 Architecture and Training","Diffusion Models Beat GANs on Image Synthesis"])

style_input = st.selectbox("Select Explantion Style,",["Beginner-Friendly","Professional","Technical","code-Oriented","Mathematical"])

length_input = st.selectbox("Select Explantion Length",["short(1-2 paragraphs)", "Medium(3-5 paragraphs)", "Long(detailed paragraphs)"])


template = PromptTemplate(
    template= """
Please summarize the research paper titled "{paper_input}" with the following specifications:
Explanation Style: {style_input}
Explanation Length: {length_input}
1. Mathematical Details:
   - Include relevant mathematical equations if present in the paper.
   - Explain the mathematical concepts using simple, intuitive code snippets where applicable.
2. Analogies:
   - Use relatable analogies to simplify complex ideas.
If certain information is not available in the paper, respond with:
"Insufficient information available" instead of guessing.
Ensure the summary is clear, accurate, and aligned with the provided style and length.
""",
    input_variables = ["paper_input","style_input","length_input"]
)


prompt = template.invoke({
    "paper_input":paper_input,
    "style_input":style_input,
    "length_input":length_input

})
 

# Model initialize
model = ChatGroq(model="llama-3.1-8b-instant")

# user_text = st.text_input("Enter your prompt here")

if st.button('Summarize'):
    # Model se response lena
    response = model.invoke(prompt)
    
    # Result ko screen par show karna
    st.write(response.content)