from django.shortcuts import render_to_response
from django.template import RequestContext
from fight.models import *

def index(request):
	return render_to_response("index.html", {
		
	}, RequestContext(request))


def createChar(request):
	created_chars = Character.objects.filter(creator=request.user)
	attributes = Attribute.objects.all()

	return render_to_response("createChar.html", {
		"created_chars": created_chars,
		"attributes": attributes
	}, RequestContext(request))