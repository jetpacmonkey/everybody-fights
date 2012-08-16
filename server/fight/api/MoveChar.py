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
	# TODO: Make sure cell is adjacent to char.cell
	if not cell.getCharacter():
		char.cell = cell
		char.save()
	else:
		raise Exception("Cell already occupied")
