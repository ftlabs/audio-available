const debug = require('debug')('bin:lib:get-info-for-uuid');

const checkAudio = require('./check-audio');
const generateS3URL = require('./get-s3-public-url');
const generateHumanTime = require('./generate-human-time');

module.exports = function (UUID){

	return checkAudio(UUID)
		.then(data => {
			debug(data);
			const returnValues = {};

			if(data === false){
				returnValues.haveFile = false;
			} else if(data.enabled === false){
				returnValues.haveFile = false;
			} else {
				returnValues.haveFile = true;
				returnValues.url = generateS3URL(UUID);
				returnValues.size = data.ContentLength;
				returnValues.provider = data.dbInfo.provider;
				returnValues['provider_name'] = data.dbInfo['provider_name'];
				returnValues.ishuman = data.dbInfo['is-human'] === 'true';
				returnValues.duration = {
					milliseconds : data.duration * 1000,
					seconds : data.duration,
					humantime : generateHumanTime(data.duration * 1000)
				};
			}

			return returnValues

		})
		
	;


}
