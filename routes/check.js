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
						.then(data => {

							const returnValues = {};

							if(data === false){
								returnValues.haveFile = false;
							} else {
								returnValues.haveFile = true;
								returnValues.url = generateS3URL(req.params.UUID);
								returnValues.size = data.ContentLength;
							}

							res.json(returnValues);

							uuidCache.set(req.params.UUID, returnValues);

						})
						.catch(err => {
							debug(err);
							res.status(500);
							res.end();
						})
					;

				} else {
					debug('Value is in cache. Is:', cachedValue);
					res.json(cachedValue);

				}

			})
		;

	} else {
		res.status(420);
		res.end();
	}


});

module.exports = router;
