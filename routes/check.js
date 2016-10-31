const debug = require('debug')('audio-available:routes:check');
const express = require('express');
const router = express.Router();

const checkAudio = require('../bin/lib/check-audio');
const checkUUID = require('../bin/lib/check-uuid');
const uuidCache = require('../bin/lib/uuid-cache');

router.get('/:UUID', function(req, res){

	const isValidUUID = checkUUID(req.params.UUID);

	if(isValidUUID){
		
		uuidCache.check(req.params.UUID)
			.then(cachedValue => {

				if(cachedValue === undefined){
					console.log("Value not in cache. Checking...");
					checkAudio(req.params.UUID)
						.then(weHaveThatAudioFile => {
							res.json({
								haveFile : weHaveThatAudioFile
							});
							uuidCache.set(req.params.UUID, weHaveThatAudioFile);
						})
						.catch(err => {
							console.log(err);
							res.status(500);
							res.end();
						})
					;

				} else {
					console.log('Value is in cache. Is:', cachedValue);
					res.json({
						haveFile : cachedValue
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
