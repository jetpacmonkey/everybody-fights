
def proc(request):
	scripts = [
		'js/ext/jquery-1.7.2.js',
		'js/ext/underscore.js',
		'js/ext/backbone.js',
		'js/ui/BaseViews.js'
	]

	# page-specific additions could go here

	return {
		'scripts': scripts
	}