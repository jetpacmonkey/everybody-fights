from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User
from fight.models import Map, Cell, Character
from fight.models.Attribute import Modifier, Attribute

GAME_TYPE_CHOICES = (
	('skirmish', 'Skirmish'),
)

GAME_PHASE_CHOICES = (
	(0, 'Waiting for players'),
	(1, 'Buying characters'),
	(2, 'Playing')
)

class Game(models.Model):
	name = models.CharField(max_length = 128)
	creator = models.ForeignKey(User, related_name = 'createdGames')
	currentPlayer = models.ForeignKey(User, related_name = 'currentGames', default = None, null = True)
	mapObj = models.ForeignKey(Map)
	gameType = models.CharField(max_length = 16, choices = GAME_TYPE_CHOICES, default = GAME_TYPE_CHOICES[0][0])
	minPlayers = models.IntegerField(default = 2)
	maxPlayers = models.IntegerField(default = 16)
	maxAP = models.IntegerField(default = 20)
	gamePhase = models.IntegerField(default = 0, choices = GAME_PHASE_CHOICES)
	turnNum = models.IntegerField(default = 1)
	budget = models.IntegerField(default = 50)

	def __unicode__(self):
		return "%s (%d players)" % (self.name, self.gameplayer_set.count())

	def addPlayer(self, player):
		newPlayer = GamePlayer()
		newPlayer.game = self
		newPlayer.player = player
		newPlayer.apRemaining = self.budget  # apRemaining holds the number of points that can still be spent during the buying characters phase
		newPlayer.save()

	def nextPlayer(self):
		if self.currentPlayer:
			laterPlayers = self.gameplayer_set.filter(playerNum__gt = self.currentGamePlayer().playerNum)
			if laterPlayers.exists():
				nextPlayer = laterPlayers[0]
			else:
				nextPlayer = self.gameplayer_set.all()[0]
				self.turnNum += 1
		else:
			nextPlayer = self.gameplayer_set.all()[0]
			self.turnNum = 1
		self.currentPlayer = nextPlayer.player
		nextPlayer.apRemaining = self.maxAP  # at the start of the turn, the player has the max AP
		nextPlayer.save()
		self.save()

	def currentGamePlayer(self):
		return self.gameplayer_set.filter(player=self.currentPlayer)[0]

	class Meta:
		app_label = 'fight'

class GameSetting(models.Model):
	name = models.CharField(max_length = 32)
	game = models.ForeignKey(Game)
	value = models.IntegerField(default = 0)

	class Meta:
		app_label = 'fight'

class GamePlayer(models.Model):
	game = models.ForeignKey(Game)
	player = models.ForeignKey(User)
	playerNum = models.IntegerField(default = 1, editable = False)
	status = models.CharField(max_length = 32, blank = True, default = "")
	apRemaining = models.IntegerField(default = 0, help_text = "Either the amount of AP remaining or the amount of budget remaining, depending on the game phase")

	def save(self):
		if not self.id and self.game.gameplayer_set.exists():
			self.playerNum = self.game.gameplayer_set.aggregate(models.Max('playerNum'))['playerNum__max'] + 1

		super(GamePlayer, self).save()

	def __unicode__(self):
		return "%s - Player %i (%s)" % (self.game.name, self.playerNum, self.player)

	class Meta:
		app_label = 'fight'
		unique_together = (('game', 'playerNum'), ('game', 'player'))
		ordering = ('game', 'playerNum')

class GameCell(models.Model):
	origCell = models.ForeignKey(Cell)
	game = models.ForeignKey(Game)
	#TODO: add validator enforcing cell's map matches game's map

	def __unicode__(self):
		return "%s: %s" % (self.game, self.origCell)

	def getCharacter(self):
		try:
			return self.gamecharacter
		except:
			return None

	class Meta:
		app_label = 'fight'

class GameCharacter(models.Model):
	character = models.ForeignKey('fight.Character')
	cell = models.OneToOneField(GameCell, null=True, blank=True)
	owner = models.ForeignKey(GamePlayer)
	#TODO: add validators enforcing cell's game matches owner's game

	def __unicode__(self):
		return "%s's %s" % (self.owner, self.character)

	def calcAttr(self, attrName, cell=None):
		val = self.character.attr(attrName)
		if val is None:
			return None # not a valid attribute for this character type

		if not cell:
			cell = self.cell
		if cell:
			for terrainMod in cell.origCell.terrain.terrainmodifier_set.filter(attribute__name=attrName):
				val = terrainMod.applyTo(val)
			for cellMod in cell.cellmodifier_set.filter(modifier__attribute__name=attrName).select_related('modifier'):
				val += cellMod.modifier.effect
		for charMod in self.charactermodifier_set.filter(modifier__attribute__name=attrName).select_related('modifier'):
			val += cellMod.modifier.effect
		return val


	def damage(self, damage):
		try:
			mod = CharacterModifier.objects.get(character=self, modifier__identifier="damage")
			baseMod = mod.modifier
		except:
			mod = CharacterModifier()
			mod.character = self
			baseMod = Modifier()
			baseMod.identifier = "damage"
			baseMod.attribute = Attribute.objects.get(name="health")
			baseMod.save()
			mod.modifier = baseMod
		healthLeft = self.calcAttr("health")
		finalHealth = healthLeft
		if damage > healthLeft:
			baseMod.effect -= healthLeft
			finalHealth = 0
		else:
			baseMod.effect -= damage
			finalHealth -= damage
		baseMod.save()
		return finalHealth

	class Meta:
		app_label = 'fight'

class CellModifier(models.Model):
	cell = models.ForeignKey(GameCell)
	modifier = models.ForeignKey(Modifier)

	class Meta:
		app_label = 'fight'

class CharacterModifier(models.Model):
	character = models.ForeignKey(GameCharacter)
	modifier = models.ForeignKey(Modifier)

	class Meta:
		app_label = 'fight'
