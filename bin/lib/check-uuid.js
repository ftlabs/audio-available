const isUUID = require('is-uuid');

module.exports = function(UUID){

	if(!UUID || !isUUID.anyNonNil(UUID)){
		return false;
	} else {
		return true;
	}

};