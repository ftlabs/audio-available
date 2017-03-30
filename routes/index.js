const debug = require('debug')('audio-available:routes:index');
const express = require('express');
const router = express.Router();

const healthchecks = require('../bin/lib/healthchecks');
const uuidCache = require('../bin/lib/uuid-cache');

router.get('/', function(req, res) {
	res.end();
});

router.get('/__gtg', function(req, res) {
	res.end();
});

router.get('/__health', function(req, res){

	const healthDescription = {
		schemaVersion: 1,
		name: "audio-available",
		systemCode: "ftlabs-audio-available",
		description: "A web service for determining whether or not a published FT.com article has an audio version.",
		checks: []
	};

	healthchecks()
		.then(checks => {
			healthDescription.checks = checks;
			res.json(healthDescription);
		})
		.catch(checks => {
			healthDescription.checks = checks;
			
			res.status(500);
			res.json(healthDescription);
		})
	;

});

const uuidRegex = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';
router.get(`^/purge/:UUID(${uuidRegex})$`, (req, res) => {

	debug(req.params.UUID)

	if(req.query.purgeToken === undefined){
		res.status(401);
		res.end();
	} else {

		if(req.query.purgeToken !== process.env.CACHE_PURGE_KEY){
			res.status(401);
			res.end();
		} else {
			uuidCache.delete(req.params.UUID);
			res.json({
				status : 'ok',
				message : `Item ${req.params.UUID} purged from cache.`
			});
		}

	}

});

module.exports = router;
