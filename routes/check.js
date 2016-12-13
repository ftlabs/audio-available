const debug = require('debug')('audio-available:routes:check');
const express = require('express');
const router = express.Router();

const checkAudio = require('../bin/lib/check-audio');
const checkUUID = require('../bin/lib/check-uuid');
const uuidCache = require('../bin/lib/uuid-cache');
const generateS3URL = require('../bin/lib/get-s3-public-url');

router.get('/:UUID', function(req, res){

	const isValidUUID = checkUUID(req.params.UUID);

	if(isValidUUID){
		
		uuidCache.check(req.params.UUID)
			.then(cachedValue => {

				if(cachedValue === undefined){
					debug("Value not in cache. Checking...");
					checkAudio(req.params.UUID)
						.then(weHaveThatAudioFile => {
							res.json({
								haveFile : weHaveThatAudioFile,
								url : generateS3URL(req.params.UUID)
							});
							uuidCache.set(req.params.UUID, weHaveThatAudioFile);
						})
						.catch(err => {
							debug(err);
							res.status(500);
							res.end();
						})
					;

				} else {
					debug('Value is in cache. Is:', cachedValue);
					res.json({
						haveFile : cachedValue,
						url : generateS3URL(req.params.UUID)
					});

				}

			})
		;

	} else {
		res.status(420);
		res.end();
	}


});

module.exports = router;
