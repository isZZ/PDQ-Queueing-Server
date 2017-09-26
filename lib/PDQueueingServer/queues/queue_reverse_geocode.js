var configPath = path.join(__dirname, '..', 'config', 'app-engine-config.json');
var googleMapsClient = require('@google/maps').createClient({
	key: configPath.gmapskey
});
var Queue = function( data, progress, resolve, reject ) {
	let latlng = [data.latitude, data.longitude];

	// Do some work
	progress(50);

	googleMapsClient.reverseGeocode({
		'latlng': latlng
	},
	function(err, response) {
		if (!err) {
			switch( response.json.status ){
				case 'OK':
					fanout( response.json.results[0] )
					break;
				case 'ZERO_RESULTS':
					resolve()
					break;
				case 'OVER_QUERY_LIMIT':
					reject( 'OVER_QUERY_LIMIT Google Maps services query limit reached' )
					break;
				case 'REQUEST_DENIED':
					reject( 'Google Maps geo coding request denied' )
					break;
				case 'INVALID_REQUEST':
					reject( 'Google Maps geo coding invalid request' )
					break;
				case 'UNKNOWN_ERROR':
					reject( 'Google Maps geo coding threw an unknown error' )
					break;
				default:
					reject( 'Google Maps no response status found' )
			}

			function fanout( location ){

				if( location.place_id ){
					data._new_state = 'location_search';
					data.place_id = location.place_id;
					resolve( data );

				}else{
					resolve( data );
				}

			}
		}else{
			reject( err.message );
		}

	});
}

module.exports = Queue;