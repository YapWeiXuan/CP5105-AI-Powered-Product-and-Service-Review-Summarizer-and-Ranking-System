from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
import pandas as pd
from bs4 import BeautifulSoup
from bs4.element import Comment
import urllib.request
import requests
import ollama
from pymongo import MongoClient


# import mysql.connector

app = FastAPI()

origins = ["http://localhost", "http://localhost:8080", "http://localhost:4200"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "hellow World!"}

api_key = ''
search_engine_id = ''

def word_counter(text):
    
    counter = len(text.split())
    
    return counter

def generate_summary_with_query(text, model,query):
    
    summary_word_limit = int(0.2*word_counter(text))
    
               
    prompt =  f"Summarize the given text in maximum {summary_word_limit} words. \
            The summary should only capture the main points and key details of the text that are related to the context of {query} \
            Provide a very detailed summary related to the context of {query}. \
            Provide only full sentences in your answer."
    
    response = ollama.chat(
        model=model, 
        messages=[
        {
            'role': 'system',
            'content': prompt
        },
        {
            'role': 'user',
            'content': f'In the context of {query} , summarize the follow text:' 
            + text,
        },
        {
            'role': 'assistant',
            'content': f'{query}'     
        }
        ]
        )
    
    
    summary = response['message']['content']
    
    return summary


def google_search(api_key,search_engine_id,query,**params):
    BASE_URL = ''
    final_query = query + ''' 
    -site:quora.com
    -site:reddit.com 
    -site:youtube.com 
    -site:newyorker.com 
    -site:shopee.sg 
    -site:amazon.com 
    -site:alibaba.com 
    -site:facebook.com 
    -site:tiktok.com 
    -site:instagram.com
    -site:buzzfeed.com
    -site:nytimes.com
    -site:medium.com 
    -site:imdb.com'''
    base_url = BASE_URL
    params = {
        'key':api_key,
        'cx':search_engine_id,
        'q':final_query,
        **params
    }
    
    
    response =httpx.get(base_url,params=params)
    test_response = response
    response.raise_for_status()
    return response.json()


def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True

# def tag_visible_2(element):
#     if element.parent.name in ['style', 'script',  'title']:
#         return False
#     return True


def text_from_html(body):
    try:
        soup = BeautifulSoup(body, 'html.parser')
        texts = soup.findAll(text=True)
        visible_texts = filter(tag_visible, texts)
        formatted_text = u" ".join(t.strip() for t in visible_texts)
        reformatted_text = formatted_text.replace('\n', ' ').replace('\r', '')
        final_text = ''.join([i if ord(i) < 128 else ' ' for i in reformatted_text])
        final_text = final_text.replace('\n', ' ').replace('\r', '')
        return final_text
    except Exception as ex:
        print(f'text_from_html Exception : {ex}')
        return
        


def SINGLE_OPTIMIZATION_Top_K_Change_generate_report_with_query(text, model,query,prompt,Top_K):
               

    
    response = ollama.chat(
        model=model, 
        messages=[
        {
            'role': 'system',
            'content': prompt
        },
        {
            'role': 'user',
            'content': f'In the context of "{query}" , generate an ordered and ranked list from the following text : ' 
            + text,
        },
        ],
        options = {
            "top_k": Top_K
        }
        )
    
    
    report = response['message']['content']
    
    return report

def zero_shot_prompt_SINGLE(query):
        zero_shot_prompt =  f'''You are a reviewer generating an ordered and numbered ranked list based on {query} only. \
                Each item in the ordered list should be ordered from item that appeared most amount of times in the user prompt text to the item that appeared least amount of times in the user prompt text. \
                Each item in the ordered list should have the item name and the item details from the user prompt text. \
                Bold each item on the ranking list in the response.\
                To make text bold, enclose it with double asterisks (**). Example: **text** becomes bold.\
                        
                '''
        return zero_shot_prompt



@app.post("/response_GET_LINKS")
# async def send_response(request: str = Form(...), no_of_articles : str = Form(...)):
async def send_response(request: str = Form(...)):

    
    # print('no_of_articles',no_of_articles)
    # no_of_articles = int(no_of_articles)
    MONGODB_CONNECTION_STRING = ''
    USER_AGENT = ''
    mongo_client = MongoClient(MONGODB_CONNECTION_STRINGA)
    CP5105_DB = mongo_client['CP5105_DB']
    User_Data = CP5105_DB['CP5105_COLL']
    
    # Pass Query to Google Custom Search API to get required list of Web Links
    response = google_search(
    api_key=api_key,
    search_engine_id=search_engine_id,
    query=request,
    start=1
    )
    
    List_Of_Links = [ item['link'] for item in response['items']]
    
    # Get raw HTML Text from web links , web scrape only visible text and then store them into a list
    List_Of_HTMLText = []
    FINAL_List_Of_Links = []

    for link in List_Of_Links:
        # print(link)
        # print('-------------')
        req = urllib.request.Request(
        link, 
        data=None, 
        headers={
            'User-Agent': USER_AGENT
            }
        )
        try:
            html = urllib.request.urlopen(req,timeout=30).read()
            html_text = text_from_html(html)
            html_text = html_text.strip()
            if html_text:
                List_Of_HTMLText.append(html_text)
                FINAL_List_Of_Links.append(link)
        except Exception as ex:
            print(f'List_Of_Links Exception : {ex}')
            pass
    
    # Generate summaries from each article , taking top 3 articles only
    Top3_List_Of_HTMLText = List_Of_HTMLText[:3]
    Top3_FINAL_List_Of_Links = FINAL_List_Of_Links[:3]
    # Taking top 3 articles only
    Top3_FINAL_List_Of_Links = FINAL_List_Of_Links[:3]
    
    query_data ={
        'query':request,
        'links':Top3_FINAL_List_Of_Links,
        'html_texts': Top3_List_Of_HTMLText,
        'report':'',
    }
    
    User_Data.insert_one(query_data)
    mongo_client.close()
    print('query_data',query_data['links'])
    query_data.pop('_id',None)
    
    return query_data



@app.post("/response_GET_REVIEW")
# async def send_response(request: str = Form(...), no_of_articles : str = Form(...)):
async def send_response(request: str = Form(...)):
    # print('no_of_articles',no_of_articles)
    MONGODB_CONNECTION_STRING = ''
    mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
    CP5105_DB = mongo_client['CP5105_DB']
    User_Data = CP5105_DB['CP5105_COLL']
    
    # Retrieve Query , Links and HTML_Texts
    query_data = User_Data.find_one({'query': request})
    Top3_List_Of_HTMLText = query_data['html_texts']
    Top3_FINAL_List_Of_Links = query_data['links']
    request = query_data['query']
    
    # Generate summaries from each article , taking top 3 articles only
    Summarizer_LLM_model = "llama3.1:latest"
    New_List_Of__generated_summary = []


    for HTMLText in Top3_List_Of_HTMLText:
        generated_summary = generate_summary_with_query(text = HTMLText, model=Summarizer_LLM_model,query=request)
        New_List_Of__generated_summary.append(generated_summary)
    
    # Formatting generated summaries
    formatted_List_Of_generated_summary = []

    for g_sum in New_List_Of__generated_summary:
        g_sum = g_sum.replace('\n', ' ').replace('\r', '').replace('\t',' ').replace('**',' ')
        formatted_List_Of_generated_summary.append(g_sum)
    
    # Concatenating all the summaries
    concat_summaries= ''''''
    for generated_formatted_summary in formatted_List_Of_generated_summary:
        # concat_summaries += f'''ARTICLE #{article_no}: {generated_formatted_summary} '''
        concat_summaries += f'''{generated_formatted_summary} '''

    
    # Generate final rankings report
    Top_K = 36
    prompt = zero_shot_prompt_SINGLE(request)
    final_report = SINGLE_OPTIMIZATION_Top_K_Change_generate_report_with_query(concat_summaries, Summarizer_LLM_model,request,prompt,Top_K)
    # final_report = generate_report_with_query(concat_summaries, Summarizer_LLM_model,request)
    
    query_data ={
        'query':request,
        'links':Top3_FINAL_List_Of_Links,
        'html_texts': Top3_List_Of_HTMLText,
        'report':final_report,
    }
    
    User_Data.insert_one(query_data)
    mongo_client.close()
    # print('query_data',query_data)
    query_data.pop('_id',None)
    
    return query_data

@app.get("/find_one")
async def find_querydata(query: str = Form(...)):
    #  Database Configuration
    MONGODB_CONNECTION_STRING = ''
    mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
    CP5105_DB = mongo_client['CP5105_DB']
    User_Data = CP5105_DB['CP5105_COLL']
    query_data = User_Data.find_one({'query': query})
    
    mongo_client.close()
    return query_data['query'],query_data['links'],query_data['report']


@app.get("/find_all")
async def findall_querydata():
    #  Database Configuration
    MONGODB_CONNECTION_STRING = ''
    mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
    CP5105_DB = mongo_client['CP5105_DB']
    User_Data = CP5105_DB['CP5105_COLL']
    query_data = User_Data.find()
    # print(query_data)
    
    list_of_query = []
    list_of_link = []
    list_of_report = []
    for x in query_data:
        list_of_query.append(x['query'])
        list_of_link.append(x['links'])
        list_of_report.append(x['report'])
        # print(x)
    
    
    mongo_client.close()
    return     list_of_query,list_of_link,list_of_report
    
    # # req_type = type(request)
    # test_link = "This is a test LINK"
    # test_rating = "This is a test REQUEST"
    # test_review = "This is a test REVIEW"
    # # return [
    # #         {"id": "Amazon", "link": request, "rating": test_rating, "review": test_review},
    # #         {"id": "Ebay", "link": request, "rating": test_rating, "review": test_review},
    # #     ]
    # return {
    #     "Amazon": {"link": New_List_Of__generated_summary, "rating": test_rating, "review": test_review},
    #     "Ebay": {"link": request, "rating": test_rating, "review": test_review},
    # }
    # # return {
    # #     "data": [
    # #         {"id": "Amazon", "link": request, "rating": request, "review": request},
    # #         {"id": "Ebay", "link": request, "rating": request, "review": request},
    # #     ]
    # # }
