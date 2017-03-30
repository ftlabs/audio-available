const debug = require('debug')('bin:lib:check-audio');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const database = require('./database');

module.exports = function(UUID){

	return new Promise( (resolve, reject) => {

		S3.headObject({
			Bucket : process.env.AWS_AUDIO_BUCKET,
			Key : `${UUID}.${process.env.SL_MEDIA_FORMAT || 'mp3'}`
		}, function (err, data) { 
			debug(data);
			if (err && err.code === 'NotFound') {
				resolve(false);
			} else if(err){
				reject(err);
			} else if(!err) {

				database.read({ uuid : UUID }, process.env.AWS_AUDIO_METADATA_TABLE)
					.then(metadata => {
						debug(metadata.Item);
						data.duration = metadata.Item.duration;

						if(metadata.Item.enabled === undefined){
							data.enabled = true;
						} else{
							data.enabled = metadata.Item.enabled;
						}

						resolve(data);
					})
					.catch(err => {
						debug(err);
						resolve(data);
					})
				;

			}

		});

	})

};
