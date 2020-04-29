from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer
from chatterbot.trainers import ListTrainer
import json
import emoji

#print('Loading BSSCCBot Chat Python Script...')

chatbot = ChatBot('Dr. Smoothie')

with open('discord_chat_training.json', 'r+', encoding="utf-8") as f:
    array = json.load(f)

# Create a new trainer for the chatbot
trainer = ChatterBotCorpusTrainer(chatbot)
listtrainer = ListTrainer(chatbot)

# Train based on the english corpus
trainer.train("chatterbot.corpus.english")
# Train based on the Discord messages
listtrainer.train(array)

#print('The chat bot is now running! :tada:')
# Get a response to an input statement
while True:
    msg = input()
    # the encode decode stuff just removes emoji and unicode stuff to make python shut up
    print(chatbot.get_response(emoji.demojize(msg)))
