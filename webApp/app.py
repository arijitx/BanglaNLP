from flask import Flask, request, render_template
from flask import send_file,session,jsonify
import string
import random
from random import randrange
import pymongo
import urllib 

app = Flask(__name__,template_folder='static')
f = open('vocab.txt',encoding='utf8')

vocab = []
for line in f:
    vocab.append(line.split('\t')[0])
lv = len(vocab)


img = ['none']

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/put_im',methods=['GET', 'POST'])
def put_im():
    img.append(request.values['img'])
    print("what is this",img[-1])
    print("len",len(img))
    return "success"

@app.route('/get_im')
def get_im():
    return str(img[-1])

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
