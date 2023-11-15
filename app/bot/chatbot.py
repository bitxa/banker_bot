from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
import pinecone
import os
import functools

import bot.chatbot as bot
from constants import APIKEY
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain, LLMChain

template_string = """Act as personal assistant for the organization, you're here to provide me with information and assistance in a
respectful and serious manner. Provide accurate responses 
based on the knowledge from the training data. The responses must be exaclty the training data, do not even change the semantic.
Give full and complete responses with the exact data of the document. Also show the notes of the documents.
If you found any menu in the text, properly show it as a menu.
Always show the links with the format: www.link or https://link.
Place and space after each left parenthesis ( or right ).

Always respond with the full answer, do not give it format like
    human: ...
    assitant: ...
    
CONTEXT:
{context}

QUESTION:
{question}

CHAT HISTORY:
{chat_history}

"""
prompt = PromptTemplate(input_variables=[ "context",  "question", "chat_history"], template=template_string)


@functools.lru_cache(maxsize=None)
def initialize():
   print("Initializing bot...")
   os.environ['OPENAI_API_KEY'] = str(APIKEY)
   embeddings = OpenAIEmbeddings(openai_api_key=os.environ['OPENAI_API_KEY'])

   loader = DirectoryLoader("bot/data")
   data = loader.load()
   
   text_splitter = RecursiveCharacterTextSplitter(
       chunk_size = 4000,
       chunk_overlap  = 100,
       length_function = len,
       add_start_index = True,)
   texts = text_splitter.split_documents(data)
   llm = ChatOpenAI(model_name='gpt-3.5-turbo', temperature=0.0, max_tokens=1000)
   
   vectordb = Chroma.from_documents(texts, embeddings)
   retriever = vectordb.as_retriever()

   
   memory = ConversationBufferMemory(memory_key="chat_history", input_key="question", return_messages= True, output_key='answer')
   
   
   
   global chain
   chain = ConversationalRetrievalChain.from_llm(
    llm=llm, chain_type="stuff", retriever=retriever,
    verbose = True,
    combine_docs_chain_kwargs={'prompt': prompt},
    memory = memory,
)

   print("Bot initialized!!")

@functools.lru_cache(maxsize=None)
def get_response(query):
    print("[QUERY]", query)
    
    global chain

    try:
        response = chain({"question": query})
        print("here2?")
        print(response['answer'])
        

        return response['answer'].replace("Assistant", "")
    except Exception as e:
        print(f"Error: {e}")
        print(e.__cause__)
        return "An error occurred, please check logs for details."
    