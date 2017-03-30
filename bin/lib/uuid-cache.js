const debug = require('debug')('bin:lib:uuid-cache');
const LRU = require('lru-cache');

const cache = LRU({
	max: 500,
	length: function (n, key) { return n * 2 + key.length },
	maxAge: (1000 * 60 * 60) * 0.5
});

function checkForUUIDInCache(UUID){

	debug(`Checking cache for: ${UUID}`);

	return new Promise((resolve, reject) => {

		if(UUID === undefined){	
			reject("No UUID passed");
		} else {
			resolve(cache.get(`${UUID}`));
		}

	});

};

function addUUIDIntoCache(UUID, state = true){
	debug(`Adding item into cache for: ${UUID}`);
	cache.set(UUID, state);
}

function removeItemFromCache(key = ''){
	debug(`Deleting item from cache for: ${key}`);
	cache.del(key);
}

module.exports = {
	check : checkForUUIDInCache,
	set : addUUIDIntoCache,
	delete : removeItemFromCache
};
