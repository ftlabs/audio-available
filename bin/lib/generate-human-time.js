const moment = require('moment');

module.exports = function(durationInMilliseconds){
	const formatString = durationInMilliseconds > 3600000 ? 'hh:mm:ss' : 'mm:ss';
	return moment.utc(durationInMilliseconds).format(formatString);
}