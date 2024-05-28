from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

import tensorflow_hub as hub
from tensorflow.keras.models import load_model
import tensorflow_text as text

from prepy import title_adjusment_for_model, thumbnail_adjusment_for_model, binary_result

app = FastAPI()
app.add_middleware(CORSMiddleware,
                    allow_origins=['*'],
                    allow_credentials=True,
                    allow_methods=['*'],
                    allow_headers=['*'], 
                    expose_headers=["*"])

app.mount('/static', StaticFiles(directory='static'), name='static')

class request_body(BaseModel):
    title: str
    thumbnail: str

great_model = load_model("C:\\SAINS DATA\\PERSKRIPSIAN DUNIAWI\\Ngoding Model\\Models\\8505_on_val.hdf5", custom_objects={'KerasLayer':hub.KerasLayer})


@app.get('/get_name/{name}')
def hello(name:str):
    return {'msg':f'hellooo {name}!'}

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    with open("popup.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.post('/predict')
def make_prediction(data: request_body):
    data = data.model_dump()
    title = data['title']
    thumbnail = data['thumbnail']
    predict_new = great_model.predict([title_adjusment_for_model(title), 
                                    thumbnail_adjusment_for_model(thumbnail)])
    predict_list = binary_result(predict_new[0]).tolist()
    
    return {'prediction' : predict_list}

