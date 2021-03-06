# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Modifier'
        db.create_table('fight_modifier', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('permanent', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('attribute', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['fight.Attribute'])),
            ('effect', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal('fight', ['Modifier'])

        # Adding model 'Attribute'
        db.create_table('fight_attribute', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=32)),
            ('default', self.gf('django.db.models.fields.IntegerField')(default=None, null=True)),
        ))
        db.send_create_signal('fight', ['Attribute'])

        # Deleting field 'GameCharacter.game'
        db.delete_column('fight_gamecharacter', 'game_id')

        # Adding field 'GameCharacter.owner'
        db.add_column('fight_gamecharacter', 'owner',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['fight.GamePlayer']),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'Modifier'
        db.delete_table('fight_modifier')

        # Deleting model 'Attribute'
        db.delete_table('fight_attribute')

        # Adding field 'GameCharacter.game'
        db.add_column('fight_gamecharacter', 'game',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['fight.Game']),
                      keep_default=False)

        # Deleting field 'GameCharacter.owner'
        db.delete_column('fight_gamecharacter', 'owner_id')


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
            'Meta': {'object_name': 'Attribute'},
            'default': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '32'})
        },
        'fight.cell': {
            'Meta': {'ordering': "('mapObj', 'x', 'y')", 'unique_together': "(('mapObj', 'x', 'y'),)", 'object_name': 'Cell'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mapObj': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Map']"}),
            'terrain': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.TerrainType']"}),
            'x': ('django.db.models.fields.IntegerField', [], {}),
            'y': ('django.db.models.fields.IntegerField', [], {})
        },
        'fight.character': {
            'Meta': {'object_name': 'Character'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        'fight.game': {
            'Meta': {'object_name': 'Game'},
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'createdGames'", 'to': "orm['auth.User']"}),
            'currentPlayer': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'currentGames'", 'to': "orm['auth.User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mapObj': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Map']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        'fight.gamecell': {
            'Meta': {'object_name': 'GameCell'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'origCell': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Cell']"})
        },
        'fight.gamecharacter': {
            'Meta': {'object_name': 'GameCharacter'},
            'cell': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['fight.GameCell']", 'unique': 'True'}),
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Character']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.GamePlayer']"})
        },
        'fight.gameplayer': {
            'Meta': {'ordering': "('game', 'playerNum')", 'unique_together': "(('game', 'playerNum'), ('game', 'player'))", 'object_name': 'GamePlayer'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['fight.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'playerNum': ('django.db.models.fields.IntegerField', [], {'default': '1'})
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
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32'})
        }
    }

    complete_apps = ['fight']