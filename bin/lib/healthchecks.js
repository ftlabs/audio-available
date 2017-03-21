const debug = require('debug')('bin:lib:healthchecks');

const database = require('./database');
const checkAudio = require('./check-audio');
const checkUUID = require('./check-uuid');

function readFromDatabase(){

	const checkDescription = {
		name : 'database check',
		passed : undefined
	};

	return database.describe(process.env.AWS_AUDIO_METADATA_TABLE)
		.then(function(){
			checkDescription.passed = true;
			return checkDescription;
		})
		.catch(err => {
			debug(err);
			checkDescription.passed = false;
			checkDescription.error = err;
			return checkDescription;
		})
	;
}

function checkCanReadFromBucket(){
	
	const checkDescription = {
		name : 'S3 Bucket check',
		passed : undefined
	};

	return checkAudio('ae092214-d36f-11e6-b06b-680c49b4b4c0')
		.then(function(){
			checkDescription.passed = true;
			return checkDescription;
		})
		.catch(err => {
			debug(err);
			checkDescription.passed = false;
			checkDescription.error = err;
			return checkDescription;
		})
	;
}

function checkCanValidateUUID(){

	const checkDescription = {
		name : 'validate UUID check',
		passed : undefined
	};

	const testUUID = '97779dfc-0e1e-11e7-b030-768954394623';
	const falseUUID = 'not_a_valid_UUID'

	const validUUID = checkUUID(testUUID);
	const invalidUUID = checkAudio(falseUUID);

	return Promise.all( [validUUID, invalidUUID] )
		.then(results => {
			if(results[0] !== true || results[1] !== false ){
				throw `${testUUID} test should be return 'true' and is ${results[0]}. '${falseUUID}' test should return 'false' and is ${results[1]}`
			} else {
				checkDescription.passed = true;
				return checkDescription;
			}
		})
		.catch(err => {
			debug(err);
			checkDescription.passed = false;
			checkDescription.error = err;
			return checkDescription;
		})
	;
	
}

module.exports = function(){

	const checks = [ readFromDatabase(), checkCanReadFromBucket(), checkCanValidateUUID() ];
	return Promise.all(checks)
		.catch(function(){
			throw checks;
		})
	;

}