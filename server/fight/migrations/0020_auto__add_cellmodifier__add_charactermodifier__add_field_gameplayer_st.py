# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CellModifier'
        db.create_table('fight_cellmodifier', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('cell', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['fight.GameCell'])),
            ('modifier', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['fight.Modifier'])),
        ))
        db.send_create_signal('fight', ['CellModifier'])

        # Adding model 'CharacterModifier'
        db.create_table('fight_charactermodifier', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['fight.GameCharacter'])),
            ('modifier', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['fight.Modifier'])),
        ))
        db.send_create_signal('fight', ['CharacterModifier'])

        # Adding field 'GamePlayer.status'
        db.add_column('fight_gameplayer', 'status',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=32, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'CellModifier'
        db.delete_table('fight_cellmodifier')

        # Deleting model 'CharacterModifier'
        db.delete_table('fight_charactermodifier')

        # Deleting field 'GamePlayer.status'
        db.delete_column('fight_gameplayer', 'status')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'fight.attribute': {
            'Meta': {'ordering': "['name']", 'object_name': 'Attribute'},
            'default': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'desc': ('django.db.models.fields.TextField', [], {'default': "''", 'max_length': '256', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '32'})
        },
        'fight.cell': {
            'Meta': {'ordering': "('mapObj', 'x', 'y')", 'unique_together': "(('mapObj', 'x', 'y'),)", 'object_name': 'Cell'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mapObj': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Map']"}),
            'terrain': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.TerrainType']", 'null': 'True'}),
            'x': ('django.db.models.fields.IntegerField', [], {}),
            'y': ('django.db.models.fields.IntegerField', [], {})
        },
        'fight.cellmodifier': {
            'Meta': {'object_name': 'CellModifier'},
            'cell': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.GameCell']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modifier': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Modifier']"})
        },
        'fight.character': {
            'Meta': {'ordering': "['name', 'creator__username']", 'object_name': 'Character'},
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        'fight.characterattribute': {
            'Meta': {'object_name': 'CharacterAttribute'},
            'attribute': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Attribute']"}),
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Character']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'value': ('django.db.models.fields.IntegerField', [], {})
        },
        'fight.charactermodifier': {
            'Meta': {'object_name': 'CharacterModifier'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.GameCharacter']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modifier': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Modifier']"})
        },
        'fight.characterset': {
            'Meta': {'object_name': 'CharacterSet'},
            'chars': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['fight.Character']", 'symmetrical': 'False'}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'New Set'", 'max_length': '128'})
        },
        'fight.game': {
            'Meta': {'object_name': 'Game'},
            'budget': ('django.db.models.fields.IntegerField', [], {'default': '50'}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'createdGames'", 'to': "orm['auth.User']"}),
            'currentPlayer': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'currentGames'", 'null': 'True', 'to': "orm['auth.User']"}),
            'gamePhase': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'gameType': ('django.db.models.fields.CharField', [], {'default': "'skirmish'", 'max_length': '16'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mapObj': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Map']"}),
            'maxAP': ('django.db.models.fields.IntegerField', [], {'default': '20'}),
            'maxPlayers': ('django.db.models.fields.IntegerField', [], {'default': '16'}),
            'minPlayers': ('django.db.models.fields.IntegerField', [], {'default': '2'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'turnNum': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        'fight.gamecell': {
            'Meta': {'object_name': 'GameCell'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'origCell': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Cell']"})
        },
        'fight.gamecharacter': {
            'Meta': {'object_name': 'GameCharacter'},
            'cell': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['fight.GameCell']", 'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Character']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.GamePlayer']"})
        },
        'fight.gameplayer': {
            'Meta': {'ordering': "('game', 'playerNum')", 'unique_together': "(('game', 'playerNum'), ('game', 'player'))", 'object_name': 'GamePlayer'},
            'apRemaining': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'game': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'playerNum': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '32', 'blank': 'True'})
        },
        'fight.gamesetting': {
            'Meta': {'object_name': 'GameSetting'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'value': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'fight.map': {
            'Meta': {'ordering': "('creator', 'name')", 'object_name': 'Map'},
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        'fight.modifier': {
            'Meta': {'object_name': 'Modifier'},
            'attribute': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Attribute']"}),
            'effect': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'permanent': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'fight.terraintype': {
            'Meta': {'object_name': 'TerrainType'},
            'color': ('django.db.models.fields.CharField', [], {'default': "'#FFFFFF'", 'max_length': '32'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32'})
        }
    }

    complete_apps = ['fight']