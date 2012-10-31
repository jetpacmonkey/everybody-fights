from django.db import models
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from fight.models.AI import AIEngine

class UserProfile(models.Model):
	user = models.OneToOneField(User)

	aiEngine = models.ForeignKey(AIEngine, null=True, default=None, blank=True, verbose_name="AI Engine")
	aiSettings = models.TextField(default="{}", help_text="JSON dictionary of settings that certain AI types may need")

	def __unicode__(self):
		return "%s's profile" % self.user.username

	class Meta:
		app_label = 'fight'

def profileGetter(user):
	try:
		return user.userprofile
	except:
		pro = UserProfile()
		pro.user = user
		return user.userprofile

User.profile = property(profileGetter)


# Admin page settings
class UserProfileInline(admin.StackedInline):
	model = UserProfile
	can_delete = False
	verbose_name_plural = "profile"


# A UserAdmin of my very own!
class UserAdmin(UserAdmin):
	inlines = (UserProfileInline,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
