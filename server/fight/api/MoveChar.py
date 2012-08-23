from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from fight.models import GameCharacter, GameCell

@login_required
def followPath(request, charId, pathHash):
	resp = HttpResponse()

	gChar = GameCharacter.objects.get(id=charId)
	gCellIds = pathHash.split(":")

	try:
		for cellId in gCellIds:
			gCell = GameCell.objects.get(id=cellId)
			moveChar(gChar, gCell)
	except Exception as e:
		resp.status_code = 400
		resp.content = str(e)
		return resp

	resp.status_code = 200
	resp.content = ""

	return resp


def moveChar(char, cell):
	# Make sure cell is adjacent to char.cell and gamePlayer has enough AP
	if char.cell:
		if not char.cell.origCell.isAdj(cell.origCell):
			raise Exception("Cell not adjacent to character's previous location")
	else:
		# Character just entering the board, must enter from an edge
		dim = cell.origCell.mapObj.dimensions()
		if not (cell.origCell.x == 0 or cell.origCell.y == 0 or cell.origCell.x == dim[0] - 1 or cell.origCell.y == dim[1] - 1):
			raise Exception("Characters must join the board from an edge")
	if not cell.getCharacter():
		char.cell = cell
		char.save()
	else:
		raise Exception("Cell already occupied")

	# Subtract appropriate AP from gamePlayer
	owner = char.owner
	moveCost = char.calcAttr("moveCost")
	owner.apRemaining -= moveCost
	owner.save()
