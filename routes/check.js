const debug = require('debug')('audio-available:routes:check');
const express = require('express');
const router = express.Router();

const getInfoForUUID = require('../bin/lib/get-info-for-uuid');

router.get(`/:UUID([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})`, (req, res) => {
		
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

});

module.exports = router;
