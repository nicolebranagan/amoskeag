#!/usr/bin/python3
# CLIent: Barebones user client for Amoskeag
#
# Commands:
# look: Lists everything you can look at
# look <at>: Looks at <at>
# move <dir>: Moves to that location
# talk: List every possible talk command
# talk <cmd>: Talks to that person, or says that response if already talking
# exit: Quits
# All other commands simply display the room information (and reset conversations)

import requests
import json

server = 'http://localhost:9999'

def get_token():
  global server
  r = requests.get(server + '/users/token').json()
  if ('success' in r):
    return r['token']
  else:
    raise IOError

class Game():
  def __init__(self, token):
    self.token = token
  
  def _get(self, url):
    r = requests.get(server + url, headers = {
      'Authorization': 'Bearer ' + self.token
    }).json()
    if ('success' in r):
      if (r["success"] == True):
        return r["output"]
      else:
        raise IOError(r["message"])
    else:
      raise IOError()
    
  def _post(self, url, data):
    r = requests.post(server + url, headers = {
      'Authorization': 'Bearer ' + self.token
    }, data=data).json()
    if ('success' in r):
      return r
    else:
      raise IOError()
  
  def __say(self, data):
    labels = [e["label"] for e in data]
    return ', '.join(labels)
  
  def __go(self, data, dest):
    try:
      url = next(i["href"] for i in data if i["label"] == dest)
    except StopIteration:
      return "Can't find " + dest
    r = self._get(
      url
    )
    if ("talk" in r):
      self.talks = r["talk"]
    return r["desc"]
    
  def look(self):
    r = self._get('/game/look')
    self.exits = r["exit"]
    self.looks = r["look"]
    self.talks = r["talk"]

    return r["desc"] + "\n\nExits are " + ', '.join([e["label"] for e in self.exits])
  
  def talk(self):
    return self.__say(self.talks)
  
  def look_at(self):
    return self.__say(self.looks)

  def talk_to(self, to):
    return self.__go(self.talks, to)
  
  def look_at_to(self, to):
    return self.__go(self.looks, to)
  
  def move(self, dest):
    print(self.exits)
    try:
      xit = next(i["exit"] for i in self.exits if i["label"] == dest)
    except StopIteration:
      return "Can't go there"
    r = self._post('/game/move', {"exit":xit})
    if (r["success"] == True):
      return self.look()
    else:
      if ("message" in r):
        return r["message"]
      return "Can't go there."

cond = True
game = Game(get_token())
print(game.look())
while(cond):
  text = input('$ ')
  try:
    if (text == "exit"):
      cond = False
      print("Thanks for playing!")
    elif (text == "talk"):
      print(game.talk())
    elif (text == "look"):
      print(game.look_at())
    elif (text.startswith("look ")):
      print(game.look_at_to(text[5:]))
    elif (text.startswith("talk ")):
      print(game.talk_to(text[5:]))
    elif (text.startswith("move ")):
      print(game.move(text[5: ]))
    else:
      print(game.look())
  except IOError as e:
    print("Error: " + str(e))