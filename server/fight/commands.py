from django.contrib.auth.decorators import login_required
from fight.models import *
from django.shortcuts import redirect
from django.http import HttpResponse

@login_required
def startGame(request, gameId):
	game = Game.objects.get(id=gameId)

	# validation...
	if game.gamePhase != 0:
		resp = HttpResponse()
		resp.status_code = 400
		resp.content = "That game has already been started"
		return resp

	# change the game phase
	game.gamePhase += 1
	game.save()

	game.gameplayer_set.update(apRemaining=game.budget)

	# AI characters buy characters
	aiProfiles = UserProfile.objects.exclude(aiEngine=None)
	aiGamePlayers = game.gameplayer_set.filter(player__in=aiProfiles.values_list("user", flat=True))
	for gp in aiGamePlayers:
		gp.player.profile.doAIMove(game)

	# redirect to the game's page
	return redirect('fight.views.playGame', gameId)
