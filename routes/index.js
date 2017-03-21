const express = require('express');
const router = express.Router();

const healthchecks = require('../bin/lib/healthchecks');

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
		.then(function(){
			res.json(healthDescription);
		})
		.catch(err => {
			res.status(500);
			res.json(healthDescription);
		})
	;

});

module.exports = router;
