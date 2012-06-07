from fight.models.Map import Map, MapAdmin
from fight.models.Cell import Cell, CellAdmin
from fight.models.TerrainType import TerrainType
from fight.models.Game import Game, GameSetting, GamePlayer, GameCell, GameCharacter, CellModifier, CharacterModifier, GAME_TYPE_CHOICES
from fight.models.Character import Character, CharacterAttribute
from fight.models.CharacterSet import CharacterSet
from fight.models.Attribute import Attribute, Modifier

from django.contrib import admin

admin.site.register(Map, MapAdmin)
admin.site.register(Cell, CellAdmin)
admin.site.register(TerrainType)
admin.site.register(Character)
admin.site.register(CharacterAttribute)
admin.site.register(CharacterSet)
admin.site.register(Game)
admin.site.register(GameSetting)
admin.site.register(GamePlayer)
admin.site.register(GameCell)
admin.site.register(GameCharacter)
admin.site.register(Attribute)
admin.site.register(Modifier)