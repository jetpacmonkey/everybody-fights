function Utils_niceJSON(djangoFormat) {
	if (djangoFormat instanceof String || typeof(djangoFormat) == "string") {
		djangoFormat = $.parseJSON(djangoFormat);
	}

	if (djangoFormat.length == 0 || !("pk" in djangoFormat[0])) {
		return djangoFormat;
	}
	var retVal = [];
	for (var i=0; i<djangoFormat.length; ++i) {
		var obj = {};
		obj.id = djangoFormat[i].pk;
		for (var field in djangoFormat[i].fields) {
			obj[field] = djangoFormat[i].fields[field];
		}
		retVal.push(obj);
	}
	return retVal;
}