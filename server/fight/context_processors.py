
def proc(request):
	scripts = [
		'js/ext/jquery-1.7.2.js',
		'js/ext/underscore.js',
		'js/ext/backbone.js',

		'js/utils/utils.js',

		'js/ui/BaseViews.js',

		'js/models/base.js',
		'js/models/user.js',
		'js/models/attribute.js',
		'js/models/character.js',
	]

	# page-specific additions could go here

	return {
		'scripts': scripts
	}