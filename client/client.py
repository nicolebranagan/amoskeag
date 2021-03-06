#!/usr/bin/python3
# CLIent: Barebones user client for Amoskeag
#
# Commands:
# look: Lists everything you can look at (stuff in stage, and your inventory)
# look <at>: Looks at <at>
# move: Lists where you can move to
# move <dir>: Moves to that location
# talk: List every possible talk command
# talk <cmd>: Talks to that person, or says that response if already talking
# get: List everything you can get
# get <obj>: Gets that object
# status: Lists your current inventory
# Blank command: Displays room info again
# exit: Quits

import requests
import json
import time

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
    self.inventory = []
  
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
    }, json=data).json()
    if ('success' in r):
      if ('output' in r):
        return r['output']
      if ('message' in r):
        raise IOError(r["message"])
    raise IOError(str(r))

  def __update(self, r):
    out = r["desc"]
    if ("exit" in r):
      self.exits = r["exit"]
      if (len(self.exits) != 0):
        out = out + "\n\nExits are " + ','.join([e["label"] for e in self.exits])

    if ("talk" in r):
      self.talks = r["talk"]
      if (len(self.talks) != 0):
        say = []
        opt = 'abcdefghijklmnopqr'
        for idx, e in enumerate(r["talk"]):
          e["say"] = e["label"]
          e["label"] = opt[idx]

    if ("look" in r):
      self.looks = r["look"]
      self.looks.extend(
        ({"label" : e["label"],
          "id" : e["look"]} for e in self.inventory)
      )

    if ("get" in r):
      self.gets = r["get"]

    if ("endgame" in r):
      self.talks = []
      self.exits = []
      self.looks = []
      self.gets = []
      return r["desc"] + "\n\n **** GAME OVER ****"

    if ("title" in r):
      out = r["title"] + "\n\n" + out
    return out
  
  def __say(self, data):
    labels = [e["label"] for e in data]
    return ', '.join(labels)

  def __gopost(self, data, dest, label):
    try:
      target = next(i["id"] for i in data if i["label"] == dest)
    except StopIteration:
      return "Can't find " + dest
    r = self._post('/game/'+label, {"id": target})
    if (label is "move"):
      r = self._get('/game/look')
    return self.__update(r)
    
  def look(self):
    r = self._get('/game/look')
    return self.__update(r)
  
  def talk(self):
    out = ""
    if (len(self.talks) != 0):
      say = []
      opt = 'abcdefghijklmnopqr'
      for idx, e in enumerate(self.talks):
        say.append(opt[idx] + ") " + e["say"])
      out = '\n'.join(say)
    return out
  
  def lookat(self):
    return self.__say(self.looks)
  
  def get(self):
    return self.__say(self.gets)
  
  def move(self):
    return self.__say(self.exits)

  def talk_to(self, to):
    out = self.__gopost(self.talks, to, "talk")
    if (len(self.talks) != 0):
      out = out + "\n\n" + self.talk()
    return out
  
  def lookat_to(self, to):
    out = self.__gopost(self.looks, to, "look")
    if (len(self.talks) != 0):
      out = out + "\n\n" + self.talk()
    return out

  def get_to(self, to):
    out = self.__gopost(self.gets, to, "get")
    self.look()
    return out
  
  def move_to(self, to):
    return self.__gopost(self.exits, to, "move")
  
  def use(self, id, on):
    try:
      item = next(i["id"] for i in self.looks if i["label"] == id)
      target = next(i["id"] for i in self.looks if i["label"] == on)
    except StopIteration:
      return "Can't do that"
    
    r = self._post('/game/use', {"id":item, "target":target})
    return self.__update(r)

  def consume(self, to):
    return self.__gopost(self.looks, to, "use")

  def status(self):
    r = self._get('/game/status')
    self.inventory = r["inventory"]
    return "Inventory: " + ", ".join([e["label"] for e in r["inventory"]])

  def save(self):
    return str(self._get('/game/save'))

  def saves(self):
    return str(self._get('/game/saves'))

  def load(self, guid):
    return str(self._post('/game/load', {"id": guid}))

cond = True
game = Game(get_token())
time.sleep(0.5)
print("Connected to Amoskeag server at " + server + " with token " + game.token)
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
      print(game.lookat())
    elif (text == "move"):
      print(game.move())
    elif (text == "get"):
      print(game.get())
    elif (text == "save"):
      print(game.save())
    elif (text == "saves"):
      print(game.saves())
    elif (text.startswith("load ")):
      print(game.load(text[5:]))
    elif (text.startswith("look ")):
      print(game.lookat_to(text[5:]))
    elif (text.startswith("talk ")):
      print(game.talk_to(text[5:]))
    elif (text.startswith("move ")):
      print(game.move_to(text[5: ]))
    elif (text.startswith("get ")):
      print(game.get_to(text[4: ]))
      game.status()
    elif (text.startswith("status")):
      print(game.status())
    elif (text.startswith("use ")):
      cmd = text[4:].split(" on ")
      if (len(cmd) < 2):
        print(game.consume(cmd[0]))
      else:
        print(game.use(cmd[0], cmd[1]))
    elif (text == ""):
      print(game.look())
    else:
      print("I don't understand that command.")
  except IOError as e:
    print("Error: " + str(e))
