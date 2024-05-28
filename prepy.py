import string
import numpy as np
import re
import cv2
import skimage
from nltk.stem import WordNetLemmatizer

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F1E0-\U0001F1FF"  # flags (iOS)
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F700-\U0001F77F"  # alchemical symbols
    "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
    "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA00-\U0001FA6F"  # Chess Symbols
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002702-\U000027B0"  # Dingbats
    "\U000024C2-\U0001F251" 
    "]+")

def text_processing(sentences):
    kalimat = sentences
    kalimat_lower = kalimat.lower()
    kalimat_nonum = re.sub(r"\d+", "", kalimat_lower)
    kalimat_nomention = re.sub(r'(@[A-Za-z0-9_]+)', '', kalimat_nonum)
    kalimat_nohashtag = re.sub(r'(#[A-Za-z0-9_]+)','', kalimat_nomention)
    kalimat_nolink = re.sub('http://\S+|https://\S+', '', kalimat_nohashtag)
    kalimat_nopunct = kalimat_nolink.translate(str.maketrans("","",string.punctuation))
    kalimat_nopunct2 = re.sub(r'[^\w\s]','', kalimat_nopunct)
    kalimat_nospace = kalimat_nopunct2.strip()
    kalimat_noemot = re.sub(EMOJI_PATTERN, '', kalimat_nospace)
    
    return kalimat_noemot

lemmatizer = WordNetLemmatizer()
def lemmatize_words(text):
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words]
    return ' '.join(words)

def isEnglish(s):
    return s.isascii()

### CORE FUNCTION ###
def title_adjusment_for_model(text):
    list_of_title = []
    
    step1 = text_processing(text)
    step2 = lemmatize_words(step1)
    list_of_title.append(step2)
    return np.array(list_of_title)
    

def thumbnail_adjusment_for_model(image_link):
    list_of_thumbnail = []
    
    img = skimage.io.imread(image_link)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, (235, 130))
    list_of_thumbnail.append(img)
    
    return np.array(list_of_thumbnail)

def binary_result(prediction_array):
    binary_prediction = np.where(prediction_array > 0.5, 1, 0)
    
    return binary_prediction