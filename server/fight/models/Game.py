from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User
from fight.models import Map, Cell, Character

GAME_TYPE_CHOICES = (
	('skirmish', 'Skirmish'),
)

class Game(models.Model):
	name = models.CharField(max_length = 128)
	creator = models.ForeignKey(User, related_name = 'createdGames')
	currentPlayer = models.ForeignKey(User, related_name = 'currentGames')
	mapObj = models.ForeignKey(Map)
	gameType = models.CharField(max_length = 16, choices = GAME_TYPE_CHOICES, default = GAME_TYPE_CHOICES[0][0])

	def __unicode__(self):
		return "%s (%d players)" % (self.name, self.gameplayer_set.count())

	def addPlayer(self, player):
		newPlayer = GamePlayer()
		newPlayer.game = self
		newPlayer.player = player
		newPlayer.save()

	def nextPlayer(self):
		laterPlayers = self.gameplayer_set.filter(playerNum__gt = currentPlayer.playerNum).order_by('playerNum')
		if laterPlayers.exists():
			currentPlayer = laterPlayers[0]
		else:
			currentPlayer = self.gameplayer_set.order_by('playerNum')[0]

	class Meta:
		app_label = 'fight'

class GamePlayer(models.Model):
	game = models.ForeignKey(Game)
	player = models.ForeignKey(User)
	playerNum = models.IntegerField(default = 1, editable = False)

	def save(self):
		if not self.id and self.game.gameplayer_set.exists():
			self.playerNum = self.game.gameplayer_set.aggregate(models.Max('playerNum'))['playerNum__max'] + 1

		super(GamePlayer, self).save()

	class Meta:
		app_label = 'fight'
		unique_together = (('game', 'playerNum'), ('game', 'player'))
		ordering = ('game', 'playerNum')

class GameCell(models.Model):
	origCell = models.ForeignKey(Cell)
	game = models.ForeignKey(Game)

	class Meta:
		app_label = 'fight'

class GameCharacter(models.Model):
	character = models.ForeignKey('fight.Character')
	cell = models.OneToOneField(GameCell)
	owner = models.ForeignKey(GamePlayer)
	#TODO: add validators enforcing cell's game matches owner's game

	def calcAttr(self, attrName):
		val = self.character.attr(attrName)
		if val is None:
			return None # not a valid attribute for this character type
		for cellMod in self.cell.cellmodifier_set.filter(modifier__attribute__name=attrName).select_related('modifier'):
			val += cellMod.modifier.effect
		for charMod in self.charactermodifier_set.filter(modifier__attribute__name=attrName).select_related('modifier'):
			val += cellMod.modifier.effect
		return val


	class Meta:
		app_label = 'fight'

class CellModifier(models.Model):
	cell = models.ForeignKey(GameCell)
	modifier = models.ForeignKey("fight.Modifier")

class CharacterModifier(models.Model):
	character = models.ForeignKey(GameCharacter)
	modifier = models.ForeignKey("fight.Modifier")