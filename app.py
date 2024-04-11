from dotenv import load_dotenv
load_dotenv()

import os
import google.generativeai as genai
from flask import Flask, render_template, request

app = Flask(__name__)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        question = request.form['input']
        response = get_gemini_response(question)
        chat_history = [(f"You: {question}", response)]
        return render_template('index.html', response=response, chat_history=chat_history)
    return render_template('index.html')

def get_gemini_response(question):
    response = chat.send_message(question, stream=True)
    return '\n'.join([chunk.text for chunk in response])

if __name__ == '__main__':
    app.run(debug=True)