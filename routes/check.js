const debug = require('debug')('audio-available:routes:check');
const express = require('express');
const router = express.Router();

const checkAudio = require('../bin/lib/check-audio');
const generateS3URL = require('../bin/lib/get-s3-public-url');
const generateHumanTime = require('../bin/lib/generate-human-time');

const MAX_CHECK_AGE = process.env.MAX_CHECK_AGE || 1800;

function getInfoForUUID(UUID){

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

router.get(`/:UUID([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})`, (req, res) => {
		
	getInfoForUUID(req.params.UUID)
		.then(data => {
			res.setHeader('Cache-Control', `public, max-age=${MAX_CHECK_AGE}`);
			res.json(data);
		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.end();
		})
	;

});

module.exports = router;
