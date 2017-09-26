var configPath = path.join(__dirname, '..', 'config', 'app-engine-config.json');

var googleMapsClient = require( '@google/maps' ).createClient({
	key: configPath.gmapskey
});

var Queue = function( data, progress, resolve, reject ) {

	// Finish the task asynchronously
	var placeid = data.place_id;
	
	// Do some work
  progress(50);

	googleMapsClient.place({
		placeid: config.gmapskey
	},
	function( err, response ){
		
		if( err ){
			reject( err.message )
		}

		resolve( response )
	});
}

module.exports = Queue;