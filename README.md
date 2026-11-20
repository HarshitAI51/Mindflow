
MindFlow makes it easy to “let it all out”; to get everything you have going round and round in your heads out on paper and all in one place.

It’s not too difficult to do work that you have to complete, but rather the hard part is to keep track of all the things that you need to remember, what is the first thing to do and what needs attention first.

With MindFlow you can write down everything in your own words just as you would talk normally. It converts unstructured text inputs into well-structured task lists with the corresponding priorities attached, the task dates, times and categories.

The idea here is quite simple: stop memorizing everything that you have in mind and see what you need to do next.

How It Works

Write down your brain dump.

MindFlow analyzes written text according to its NLP technology.

It is able to find the separate tasks, their details from the written text.

Tasks will be classified into the TASK, DEADLINE and APPOINTMENT categories. 

Each task will receive its priority level rating either HIGH, MEDIUM or LOW.

Dates and times are taken out and put into a standard format

Repository layout

mindflow/
├── backend/       FastAPI + NLP pipeline (Python)
├── frontend/      React + Vite + Tailwind CSS
└── docs/          architecture.md, api_contract.md

Quick start

Backend

cd backend

python -m venv .venv

# Windows
.venv\Scripts\Activate.ps1

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt

python -m spacy download en_core_web_sm

uvicorn app.main:app --reload

Frontend

cd frontend

npm install
npm run dev

NLP pipeline

MindFlow employs a hybrid NLP model, which brings together the pre-trained English model of spaCy and customized extraction rules.

There are main parts of the pipeline as follows:

Tokenization breaks the input into several tokens.

POS tagging identifies the parts of speech of the words, i.e., nouns and verbs.

Lemmatization finds the base forms of the words.

Dependency Parsing is used to identify the connections between actions and action-related words.

Named Entity Recognition detects the entities found useful such as dates and times.

Temporal Extraction employs dateparser and customized logic to resolve the phrases such as "tomorrow," "next Friday," "5 PM" and others.

Rule-based classification identifies type and priority of tasks based on certain linguistic markers and own rules.

Tech stack

Backend

Python

FastAPI

spaCy

en_core_web_sm

dateparser

Regex and custom NLP rules

Pydantic

Frontend

React

Vite

Tailwind CSS

Project goal

MindFlow isn't about making another complicated task manager.

It's about making it easier to get started when your head is full of things to do. Write everything down, see it organized, and focus on what comes next.