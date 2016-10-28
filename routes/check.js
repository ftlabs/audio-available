const express = require('express');
const router = express.Router();

const checkAudio = require('../bin/lib/check-audio');
const checkUUID = require('../bin/lib/check-uuid');

router.get('/:UUID', function(req, res){

	const isValidUUID = checkUUID(req.params.UUID);

	if(isValidUUID){
		
		checkAudio(req.params.UUID)
			.then(weHaveThatAudioFile => {
				res.json({
					haveFile : weHaveThatAudioFile
				});
			})
			.catch(err => {
				console.log(err);
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
