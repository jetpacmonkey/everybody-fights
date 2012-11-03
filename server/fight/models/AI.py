from django.db import models
from django.db.models import Q
from fight.models.Game import *
import random

def adjCells(gameCell):
	origCell = gameCell.origCell
	x = origCell.x
	y = origCell.y
	return GameCell.objects.filter(
		(Q(origCell__x=x) & Q(origCell__y=y+1) | Q(origCell__y=y-1)) |  # same column
		((Q(origCell__x=x-1) | Q(origCell__x=x+1)) & (Q(origCell__y=y) | Q(origCell__y=y+(1 if x%2 else -1)))),
		game=gameCell.game
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
			char = characters[random.randint(0, characters.count())]  # randomly decide what character will be doing an action
			moveCost = char.calcAttr("moveCost")
			rngAtkCost = char.calcAttr("rangeAttackCost")
			melAtkCost = char.calcAttr("meleeAttackCost")
			apRemaining = player.apRemaining

			adj = adjCells(char.cell)
			openAdj = adj.filter(gamecharacter=None)

			availActionTypes = []
			if moveCost <= apRemaining and openAdj.exists():
				availActionTypes.append("move")
			if melAtkCost <= apRemaining and adj.exclude(openAdj).exists():
				availActionTypes.append("melAtk")
			if rngAtkCost <= apRemaining:
				pass

	class Meta:
		app_label = "fight"
		verbose_name = "AI Engine"


