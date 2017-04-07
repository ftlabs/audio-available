const debug = require('debug')('audio-available:routes:check');
const express = require('express');
const router = express.Router();

const checkAudio = require('../bin/lib/check-audio');
const checkUUID = require('../bin/lib/check-uuid');
const uuidCache = require('../bin/lib/uuid-cache');
const generateS3URL = require('../bin/lib/get-s3-public-url');
const generateHumanTime = require('../bin/lib/generate-human-time');

const holdingTime = process.env.HOLDING_TIME || 2000;

function getInfoForUUID(UUID, attempt = 0){

	return uuidCache.check(UUID)
		.then(cachedValue => {
			debug(cachedValue);
			if(cachedValue === undefined){
				debug("Value not in cache. Checking...");
				uuidCache.set(UUID, 'checking');
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
							returnValues.ishuman = data.dbInfo['is-human'];
							returnValues.duration = {
								milliseconds : data.duration * 1000,
								seconds : data.duration,
								humantime : generateHumanTime(data.duration * 1000)
							};
						}

						uuidCache.set(UUID, returnValues);
						return returnValues

					})
					
				;

			} else if(cachedValue === 'checking'){

				debug('Check in progress holding request...');
				return new Promise( (resolve, reject) => {
						setTimeout(function(){
							if(attempt < 5){
								resolve();
							} else {
								reject();
							}
						}, holdingTime);
					})
					.then(function(){
						return getInfoForUUID(UUID, attempt + 1);
					})
				;

			} else {
				debug('Value is in cache. Is:', cachedValue);
				return cachedValue
			}

		})
	;

}

router.get('/:UUID', function(req, res){

	const isValidUUID = checkUUID(req.params.UUID);

	if(isValidUUID){
		
		getInfoForUUID(req.params.UUID)
			.then(data => {
				res.json(data);
			})
			.catch(err => {
				debug(err);
				res.status(500);
				res.end();
			})
		;

	} else {
		res.status(420);
		res.end();
	}

});

module.exports = router;
