from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from fight.models import Game

@login_required
def endTurn(request, gameId):
	requester = request.user
	game = Game.objects.get(id=gameId)
	resp = HttpResponse()
	if game.currentPlayer == requester:
		game.nextPlayer()
		resp.status_code = 200
		return resp
	else:
		resp.status_code = 400
		resp.content = "It is not your turn in that game"
		return resp
