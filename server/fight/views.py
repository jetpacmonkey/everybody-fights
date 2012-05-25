from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from fight.models import *

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