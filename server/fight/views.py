from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from fight.models import *

def index(request):
	return render_to_response("index.html", {
		
	}, RequestContext(request))

@login_required
def createChar(request):
	created_chars = Character.objects.filter(creator=request.user)
	attributes = Attribute.objects.all()
	character_attributes = CharacterAttribute.objects.filter(character__in=created_chars)

	return render_to_response("createChar.html", {
		"created_chars": created_chars,
		"attributes": attributes,
		"character_attributes": character_attributes
	}, RequestContext(request))