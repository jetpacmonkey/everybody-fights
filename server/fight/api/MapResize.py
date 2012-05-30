from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from fight.models import Map, Cell
from fight.utils.Utils import toJSON
from django.db.models import Max, Min

@login_required
def resize(request, mapId, x, y):
	mapObj = Map.objects.get(id=mapId)
	x = int(x)
	y = int(y)
	resp = HttpResponse()
	resp.status_code = 200

	mapCells = Cell.objects.filter(mapObj=mapObj)
	dimData = mapCells.aggregate(Max('x'), Max('y'))
	maxX = dimData['x__max']
	maxY = dimData['y__max']
	oldX = (maxX if maxX is not None else -1) + 1
	oldY = (maxY if maxY is not None else -1) + 1

	addedIds = []
	removed = []

	if x < oldX or y < oldY:
		for cell in mapCells:
			if cell.x >= x or cell.y >= y:
				removed.append(cell.id)
	mapCells.filter(id__in=removed).delete()
	
	if x > oldX:
		for i in range(oldX, x):
			for j in range(0, y):
				newCell = Cell()
				newCell.mapObj = mapObj
				newCell.x = i
				newCell.y = j
				newCell.save()
				addedIds.append(newCell.id)

	if y > oldY:
		for j in range(oldY, y):
			for i in range(0, oldX):
				newCell = Cell()
				newCell.mapObj = mapObj
				newCell.x = i
				newCell.y = j
				newCell.save()
				addedIds.append(newCell.id)

	added = Cell.objects.filter(id__in=addedIds)

	resp.content = toJSON({"added": added, "removed": removed})
	return resp