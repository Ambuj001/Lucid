from langchain_huggingface import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from dotenv import load_dotenv

load_dotenv()

model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0" 
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=100
)

llm = HuggingFacePipeline(pipeline=pipe)

print("Invoking model...")
# TinyLlama Chat models require a specific prompt format
prompt = "<|user|>\nwhat is the capital of india ?</s>\n<|assistant|>\n"
result = llm.invoke(prompt)
print(result)