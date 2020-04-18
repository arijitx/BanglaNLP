
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

def convert_and_save(data_uri,fn='im.jpg'):
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
    convert_and_save(request.values['img'], fn=uid+'.jpg')
    print("userid",uid)
    return "success"

def construct_meta(im, title):
    c = '<html><head>'
    c += '<meta property="og:image" content="http://bn-trans.herokuapp.com/static/'+im+'.jpg"></meta>'
    c += '<meta property="og:title" content="'+title+'"></meta>'
    # c += '<meta property="og:url" content="http://bn-trans.herokuapp.com/"></meta>'
    c += '</head><body><script>window.location.href="https://bn-trans.herokuapp.com/"; </script></body></html>'
    return c 

@app.route('/get_im',methods=['GET'])
def get_im():
    
    uid = request.args.get('q')
    # print("getim- userid",uid)
    c = construct_meta(uid,"Check your Bangla skill!")
    # print(c)
    return c

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

