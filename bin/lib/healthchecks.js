const debug = require('debug')('bin:lib:healthchecks');
const moment = require('moment');

const database = require('./database');
const checkAudio = require('./check-audio');
const checkUUID = require('./check-uuid');

class Check{

	constructor(name, severity = 1){
		this.name = name;
		this.ok = false;
		this.severity = severity;
		this.businessImpact = "TODO";
		this.technicalSummary = "TODO";
		this.panicGuide = "TODO";
		this.checkOutput = "TODO";
		this.lastUpdated = moment(Date.now() / 1000, 'X').format('YYYY-MM-DDThh:mm:ss.sTZD');
	}

}

function readFromDatabase(){

	const thisCheck = new Check('database check');

	return database.describe(process.env.AWS_AUDIO_METADATA_TABLE)
		.then(function(){
			thisCheck.ok = true;
			return thisCheck;
		})
		.catch(err => {
			debug(err);
			thisCheck.ok = false;
			thisCheck.error = err;
			delete thisCheck.error.message;

			return thisCheck;
		})
	;
}

function checkCanReadFromBucket(){
	
	const thisCheck = new Check('S3 Bucket check');

	return checkAudio('ae092214-d36f-11e6-b06b-680c49b4b4c0')
		.then(function(){
			thisCheck.ok = true;
			return thisCheck;
		})
		.catch(err => {
			debug(err);
			thisCheck.ok = false;
			thisCheck.error = err;
			return thisCheck;
		})
	;
}

function checkCanValidateUUID(){

	const thisCheck = new Check('validate UUID check');

	const testUUID = '97779dfc-0e1e-11e7-b030-768954394623';
	const falseUUID = 'not_a_valid_UUID'

	const validUUID = checkUUID(testUUID);
	const invalidUUID = checkAudio(falseUUID);

	return Promise.all( [validUUID, invalidUUID] )
		.then(results => {
			if(results[0] !== true || results[1] !== false ){
				throw `${testUUID} test should be return 'true' and is ${results[0]}. '${falseUUID}' test should return 'false' and is ${results[1]}`
			} else {
				thisCheck.ok = true;
				return thisCheck;
			}
		})
		.catch(err => {
			debug(err);
			thisCheck.ok = false;
			thisCheck.error = err;
			return thisCheck;
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