const LRU = require('lru-cache');

const cache = LRU({
	max: 500,
	length: function (n, key) { return n * 2 + key.length },
	maxAge: (1000 * 60 * 60) * 1
});

function checkForUUIDInCache(UUID){

	return new Promise((resolve, reject) => {

		if(UUID === undefined){	
			reject("No UUID passed");
		} else {
			resolve(cache.get(`${UUID}`));
		}

	});

};

function addUUIDIntoCache(UUID, state = true){

	cache.set(UUID, state);

}

module.exports = {
	check : checkForUUIDInCache,
	set : addUUIDIntoCache
};
