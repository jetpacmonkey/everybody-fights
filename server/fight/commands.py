from django.contrib.auth.decorators import login_required
from fight.models import *
from django.shortcuts import redirect

@login_required
def startGame(request, gameId):
	game = Game.objects.get(id=gameId)

	# validation...


	# change the game phase
	game.gamePhase += 1
	game.save()

	# redirect to the game's page
	return redirect('fight.views.playGame', gameId)
