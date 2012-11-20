from django.db import models
from django.db.models import Q
from fight.models.Game import *
from fight.api.MoveChar import moveChar, doAttack
import random

def adjCells(gameCell):
	origCell = gameCell.origCell
	x = origCell.x
	y = origCell.y

	sameGame = GameCell.objects.filter(game=gameCell.game).select_related("origCell")

	adjIds = []
	# I tried doing this with SQL calls, but it kept giving me incorrect results...
	adjColY = y + (1 if x%2 else -1)
	for cell in sameGame:
		oCell = cell.origCell
		if (oCell.x == x and (oCell.y == y-1 or oCell.y == y+1)) or \
			((oCell.x == x-1 or oCell.x == x+1) and (oCell.y == y or oCell.y == adjColY)):
			adjIds.append(cell.id)
	
	return GameCell.objects.filter(id__in=adjIds)

def borderCells(game):
	mapObj = game.mapObj
	dim = mapObj.dimensions()
	return GameCell.objects.filter(
		Q(origCell__x=0) | Q(origCell__x=dim[0] - 1) | Q(origCell__y=0) | Q(origCell__y=dim[1] - 1),
		game=game
		)

class AIEngine(models.Model):
	TYPE_RAND = "random"
	TYPE_CHOICES = (
		(TYPE_RAND, "Random"),
	)

	aiType = models.CharField(max_length=16, default=TYPE_RAND, choices=TYPE_CHOICES, verbose_name="AI Engine Type")

	def __unicode__(self):
		if self.aiType == self.TYPE_RAND:
			return "Random"

	def execute(self, player, characters, all_characters):
		if self.aiType == AIEngine.TYPE_RAND:
			char = characters[random.randint(0, characters.count() - 1)]  # randomly decide what character will be doing an action
			rngAtkCost = char.calcAttr("rangeAttackCost")
			melAtkCost = char.calcAttr("meleeAttackCost")
			rng = char.calcAttr("range")
			apRemaining = player.apRemaining
			rngAttackable = []
			melAttackable = []

			if char.cell:
				adj = adjCells(char.cell)
				origCell = char.cell.origCell
			else:
				adj = borderCells(char.owner.game)
				origCell = None
			openAdj = adj.filter(gamecharacter=None)

			moveableIds = []
			for c in openAdj:
				if char.calcAttr("moveCost", cell=c) <= apRemaining:
					moveableIds.append(c.id)
			moveableAdj = openAdj.filter(id__in=moveableIds)

			availActionTypes = []
			if moveableAdj.exists():
				availActionTypes.append("move")
			if char.cell and melAtkCost <= apRemaining and adj.exclude(id__in=openAdj).exclude(gamecharacter__owner=player).exists():
				availActionTypes.append("melAtk")
				melAttackable = list(GameCharacter.objects.filter(id__in=adj.exclude(id__in=openAdj).values_list("gamecharacter", flat=True)).exclude(owner=player))
			if char.cell and rngAtkCost <= apRemaining and rng is not None:
				for c in all_characters:
					if c.owner != player and c.cell and origCell.distTo(c.cell.origCell) <= rng:
						rngAttackable.append(c)
				if len(rngAttackable):
					availActionTypes.append("rngAtk")

			if len(availActionTypes):
				action = random.choice(availActionTypes)
				gameOver = False
				if action == "move":
					moveTo = random.choice(moveableAdj)
					print "AI moving %s from %s to %s" % (char, char.cell, moveTo)
					moveChar(char, moveTo)
				elif action == "melAtk":
					target = random.choice(melAttackable)
					print "AI attacking %s with %s (melee)" % (target, char)
					gameOver = doAttack(char, target)['gameOver']
				elif action == "rngAtk":
					target = random.choice(rngAttackable)
					print "AI attacking %s with %s (ranged)" % (target, char)
					gameOver = doAttack(char, target)['gameOver']
				return not gameOver
			else:
				player.game.nextPlayer()  # can't do anything, end turn
				return False

	def buyPhase(self, player, characters):
		idToCost = {}
		idToChar = {}
		for c in characters:
			idToCost[c.id] = c.attr("cost")
			idToChar[c.id] = c
		while True:
			purchasable = []

			# find which characters are purchasable
			for cid, cost in idToCost.items():
				if cost <= player.apRemaining:
					purchasable.append(idToChar[cid])

			if not len(purchasable):
				break

			charToBuy = random.choice(purchasable)
			gc = GameCharacter()
			gc.character = charToBuy
			gc.owner = player
			gc.cell = None
			gc.save()
			player.apRemaining -= idToCost[charToBuy.id]
		player.status = "ok"
		player.save()
		# TODO: Maybe have a check to see if the game should be advanced here? This should be triggered before human players are ready, so maybe it's not an issue...

	class Meta:
		app_label = "fight"
		verbose_name = "AI Engine"


