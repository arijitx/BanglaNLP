from flask import Flask, request, render_template
from flask import send_file,session,jsonify
import string
import random
from random import randrange
import pymongo
import urllib 
from base64 import b64decode
from os import path

app = Flask(__name__,template_folder='static',static_folder='static')
f = open('vocab.txt',encoding='utf8')

vocab = []
for line in f:
    vocab.append(line.split('\t')[0])
lv = len(vocab)

def convert_and_save(data_uri,fn='im.png'):
    header, encoded = data_uri.split(",", 1)
    data = b64decode(encoded)

    with open("/app/static/"+fn, "wb") as f:
        f.write(data)
    print(path.exists("/app/static/"+fn))



@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/put_im',methods=['GET', 'POST'])
def put_im():
    uid = request.form.get('uid')
    convert_and_save(request.values['img'], fn=uid)
    print("userid",uid)
    return "success"

    
@app.route('/get_im',methods=['GET'])
def get_im():
    uid = request.args.get('q')
    print("getim- userid",uid)
    return '<html><head><meta property="og:image" content="https://bn-trans.herokuapp.com/static/'+uid+'.png"/></head><body><img src="'+uid+'.png"/></body></html>'

@app.route('/')
def home():
    randomWord = generateRandomWord()
    return render_template('index.html', word=randomWord)

# Role:    Fetching Random Words and Returning to the fetchRandomWords() Javascript Method.
# Author:  Rangan Roy (roy.rangan7@gmail.com).
@app.route('/fetchRandomWord')
def fetchRandomWord():
    randomWord = generateRandomWord()
    return randomWord

# Role:    Generating Random Word.
# Author:  Rangan Roy (roy.rangan7@gmail.com)
def generateRandomWord():
      randomWord = vocab[randrange(lv)]
      return randomWord

# app.run(debug=True)