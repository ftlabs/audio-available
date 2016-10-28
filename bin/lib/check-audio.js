const AWS = require('aws-sdk');
const S3 = new AWS.S3();

module.exports = function(UUID){

	return new Promise( (resolve, reject) => {

		S3.headObject({
			Bucket : process.env.AWS_AUDIO_BUCKET,
			Key : `${UUID}.${process.env.SL_MEDIA_FORMAT || 'mp3'}`
		}, function (err) { 

			if (err && err.code === 'NotFound') {
				resolve(false);

			} else if(err){
				reject(err);
			} else if(!err) {
				resolve(true);
			}

		});

	})

};
