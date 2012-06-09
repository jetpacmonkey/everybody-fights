function Utils_niceJSON(djangoFormat) {
	if (djangoFormat instanceof String || typeof(djangoFormat) == "string") {
		djangoFormat = $.parseJSON(djangoFormat);
	}

	if ("length" in djangoFormat && (djangoFormat.length == 0 || !("pk" in djangoFormat[0]))) {
		if ("pk" in djangoFormat) { //only one object for some reason
			return Utils_oneNiceJSON(djangoFormat);
		}
		return djangoFormat;
	}
	var retVal = [];
	for (var i=0; i<djangoFormat.length; ++i) {
		var obj = Utils_oneNiceJSON(djangoFormat[i]);
		retVal.push(obj);
	}
	return retVal;
}

function Utils_oneNiceJSON(djangoFormat) {
	if (djangoFormat instanceof String || typeof(djangoFormat) == "string") {
		djangoFormat = $.parseJSON(djangoFormat);
	}

	var obj = {};
	obj.id = djangoFormat.pk;
	for (var field in djangoFormat.fields) {
		obj[field] = djangoFormat.fields[field];
	}

	return obj;
}