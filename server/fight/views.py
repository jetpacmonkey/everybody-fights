from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from fight.models import *

MAX_NUM_PLAYERS = 16
MIN_BUDGET = 25
MAX_BUDGET = 100
MIN_START_AP = 10
MAX_START_AP = 50

def index(request):
	return render_to_response("index.html", {
		
	}, RequestContext(request))


@login_required
def createChar(request):
	created_chars = Character.objects.filter(creator = request.user)
	attributes = Attribute.objects.all()
	character_attributes = CharacterAttribute.objects.filter(character__in = created_chars)

	return render_to_response("createChar.html", {
		"created_chars": created_chars,
		"attributes": attributes,
		"character_attributes": character_attributes
	}, RequestContext(request))


@login_required
def createMap(request):
	createdMaps = Map.objects.filter(creator = request.user)
	cells = Cell.objects.filter(mapObj__in = createdMaps)
	terrainTypes = TerrainType.objects.all()

	return render_to_response("createMap.html", {
		"createdMaps": createdMaps,
		"cells": cells,
		"terrainTypes": terrainTypes
	}, RequestContext(request))


@login_required
def createGame(request):
	maps = Map.objects.all()
	createGame_defaults = {
		"minPlayers": Game._meta.get_field("minPlayers").default,
		"maxPlayers": Game._meta.get_field("maxPlayers").default,
		"maxAP": Game._meta.get_field("maxAP").default,
		"budget": Game._meta.get_field("budget").default
	}

	return render_to_response("createGame.html", {
		"GAME_TYPE_CHOICES": GAME_TYPE_CHOICES,
		"num_player_choices": range(2, MAX_NUM_PLAYERS + 1),
		"budget_choices": range(MIN_BUDGET, MAX_BUDGET + 5, 5),
		"max_ap_choices": range(MIN_START_AP, MAX_START_AP + 5, 5),
		"maps": maps,
		"defaults": createGame_defaults
	}, RequestContext(request))


@login_required
def currentGames(request):
	myTurn = request.user.currentGames.all().filter(gamePhase=2)  # only active games
	gameIds = GamePlayer.objects.filter(player=request.user).values_list("game", flat=True)
	otherGames = Game.objects.filter(id__in=gameIds).exclude(id__in=myTurn)
	return render_to_response("currentGames.html", {
		"myTurn": myTurn,
		"otherGames": otherGames
	}, RequestContext(request))


@login_required
def playGame(request, gameId):
	game = Game.objects.get(id=gameId)
	if game.gamePhase == 1:  # Buy mode
		return redirect(buyChars, gameId)

	isCur = (game.currentPlayer == request.user)

	gameCells = game.gamecell_set.all().select_related("origCell", "origCell__terrain", "character")
	cells = Cell.objects.filter(id__in=gameCells.values_list("origCell", flat=True))
	terrainTypes = TerrainType.objects.all()

	mapCols = [[None for j in range(cells[len(cells)-1].y + 1)] for i in range(cells[len(cells)-1].x + 1)]  # 2d array of Nones waiting to be filled in
	for c in gameCells:
		mapCols[c.origCell.x][c.origCell.y] = c

	gamePlayers = game.gameplayer_set.all()

	characters = Character.objects.all()
	gameChars = GameCharacter.objects.filter(owner__in=gamePlayers)
	playerChars = gameChars.filter(owner__player=request.user)

	return render_to_response("playGame.html", {
		"game": game,
		"isCur": isCur,
		"cells": cells,
		"mapCols": mapCols,
		"gameCells": gameCells,
		"terrainTypes": terrainTypes,
		"gamePlayers": gamePlayers,
		"colors": ["aqua", "red"],  # just a temporary hacky thing, eventually will want this to be part of gamePlayer
		"characters": characters,
		"gameCharacters": gameChars,
		"playerChars": playerChars
	}, RequestContext(request))


@login_required
def buyChars(request, gameId):
	game = Game.objects.get(id=gameId)
	gamePlayers = GamePlayer.objects.filter(game=game, player=request.user)
	player = gamePlayers[0]
	gameCharacters = GameCharacter.objects.filter(owner=player)
	availChars = Character.objects.all()  # this will later be different if the game is using specific character sets, or has other limiting settings
	attributes = Attribute.objects.all()  # this will probably also be filtered down at some point
	character_attributes = CharacterAttribute.objects.filter(character__in=availChars)
	try:
		costAttr = attributes.get(name="cost")
	except:
		costAttr = None

	return render_to_response("buyChars.html", {
		"game": game,
		"gamePlayers": gamePlayers,
		"gameCharacters": gameCharacters,
		"availChars": availChars,
		"attributes": attributes,
		"costAttr": costAttr,
		"character_attributes": character_attributes
	}, RequestContext(request))
