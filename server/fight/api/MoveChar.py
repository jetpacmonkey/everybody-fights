from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import simplejson
from fight.models import GameCharacter, GameCell
import random

@login_required
def followPath(request, charId, pathHash):
	resp = HttpResponse()

	gChar = GameCharacter.objects.get(id=charId)
	# TODO: Validate to make sure that character is owned by the requester
	gCellIds = pathHash.split(":")

	initAP = gChar.owner.apRemaining
	initCell = gChar.cell
	try:
		for cellId in gCellIds:
			gCell = GameCell.objects.get(id=cellId)
			if gCell != gChar.cell:
				moveChar(gChar, gCell)
	except Exception as e:
		# Rollback data
		gChar.owner.apRemaining = initAP
		gChar.cell = initCell

		# Return error page to caller
		resp.status_code = 400
		resp.content = str(e)
		return resp

	resp.status_code = 200
	resp.content = ""

	return resp


def moveChar(char, cell):
	# Make sure cell is adjacent to char.cell and gamePlayer has enough AP
	owner = char.owner
	moveCost = char.calcAttr("moveCost", cell=cell)
	if char.cell:
		if not char.cell.origCell.isAdj(cell.origCell):
			raise Exception("Cell %s not adjacent to character's previous location %s" % (cell, char.cell))
	else:
		# Character just entering the board, must enter from an edge
		dim = cell.origCell.mapObj.dimensions()
		if not (cell.origCell.x == 0 or cell.origCell.y == 0 or cell.origCell.x == dim[0] - 1 or cell.origCell.y == dim[1] - 1):
			raise Exception("Characters must join the board from an edge")
	if moveCost > owner.apRemaining:
		raise Exception("Player does not have enough AP remaining to move to that cell")
	
	if not cell.getCharacter():
		char.cell = cell
		char.save()
	else:
		raise Exception("Cell already occupied")

	# Subtract appropriate AP from gamePlayer
	owner.apRemaining -= moveCost
	owner.save()

	print "Moved %s to %s, costing %d to %s" % (char, cell, moveCost, owner)


def attack(request, charId1, charId2):
	char1 = GameCharacter.objects.get(id=charId1)
	char2 = GameCharacter.objects.get(id=charId2)
	owner = char1.owner
	owner2 = char2.owner
	resp = HttpResponse()

	# TODO: check to make sure char1 is owned by the logged-in user

	try:
		respDict = doAttack(char1, char2)
	except Exception as e:
		resp.status_code = 400
		resp.content = str(e)
		return resp

	resp.content = simplejson.dumps(respDict)
	resp.status_code = 200
	return resp


def doAttack(attacker, defender):
	owner = attacker.owner
	owner2 = defender.owner

	if owner == owner2:
		raise Exception("Can't attack your own character, genius.")

	melee = attacker.cell.origCell.isAdj(defender.cell.origCell)
	if melee:
		atk = attacker.calcAttr("meleeAttack")
		atkCost = attacker.calcAttr("meleeAttackCost")
		defense = defender.calcAttr("meleeDefense")
	else:
		# check range
		dist = attacker.cell.origCell.distTo(defender.cell.origCell)
		rng = attacker.calcAttr("range")
		if rng is None:
			raise Exception("%s characters do not have a range attack." % attacker.character.name)
		elif dist > rng:
			raise Exception("That character is out of range.")

		atk = attacker.calcAttr("rangeAttack")
		atkCost = attacker.calcAttr("rangeAttackCost")
		defense = defender.calcAttr("rangeDefense")

	if atkCost is None:
		raise Exception("That character cannot make that type of attack")

	if atkCost > owner.apRemaining:
		raise Exception("Player does not have enough AP for that kind of attack")

	damageVal = random.randint(atk - round(atk/3), atk + atk//4)
	blockVal = random.randint(max(0, defense - 3), defense + 1)
	damageDone = damageVal - blockVal

	health = defender.damage(damageDone)
	owner.apRemaining -= atkCost
	owner.save()

	if health <= 0:
		defender.kill()

	respDict = {}
	respDict['health'] = health
	respDict['damage'] = damageDone
	respDict['attackCost'] = atkCost

	print "%s attacked %s, costing %d to %s" % (attacker, defender, atkCost, owner)

	return respDict
