var configPath = path.join(__dirname, '..', 'config', 'app-engine-config.json');
var locations = require( '../helpers/locations.js' );
var serviceAccount = require( '../config/serviceAccountCredentials.json' );
var admin = require( 'firebase-admin' );
var googleMapsClient = require( '@google/maps' ).createClient({
	key: configPath.gmapskey
});

var Queue = function( data, progress, resolve, reject ) {

	// Finish the task asynchronously
	var placeid = data.place_id;
	let UID = data.UID;

	// Do some work
	progress(50);

	if(typeof(data.latitude) === 'undefined' || data.longitude === 'undefined')
		reject('Error latitude and longitude not defined');

	var locationObj = {
		'lat':data.latitude,
		'lng':data.longitude
	};

	googleMapsClient.placesNearby({
		location:locationObj,
		radius:10,
	},
	function( err, response ){
		
		if( err ){
			reject( err.message )
		}

		if(typeof(response.json) === 'undefined' || !response.json.results.length){
			resolve();
		}

		let orderedResults = locations.userLocationMeta(locationObj.lat, locationObj.lng, response.json.results);
		// Initialize the app with a custom auth variable, limiting the server's access

		// The app only has access as defined in the Security Rules
		var db = admin.database();
		var promises = [];

		for(let location in orderedResults){
			let places = orderedResults[location];
			for(let placeKey in places){
				let place = places[placeKey];
				//promises.push();
				promises.push(db.ref('userMeta/'+UID+'/userPlaces/' + location+'/'+placeKey).set(place));
			}
		}

		Promise.all(promises).then(function(){
			resolve();
		},
		function(error){
			reject( error );
		});

	});
}

module.exports = Queue;