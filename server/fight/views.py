from django.shortcuts import render_to_response
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
		"maxAP": Game._meta.get_field("maxAP").default
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
	myTurn = request.user.currentGames.all()
	gameIds = GamePlayer.objects.filter(player=request.user).values_list("game", flat=True)
	otherGames = Game.objects.filter(id__in=gameIds).exclude(id__in=myTurn)
	return render_to_response("currentGames.html", {
		"myTurn": myTurn,
		"otherGames": otherGames
	}, RequestContext(request))
