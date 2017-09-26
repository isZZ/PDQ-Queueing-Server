/* Launcher for Firebase Queues */
var invision_image            = require( './queues/queue_cloud_vision.js' );
var location_finder           = require( './queues/queue_location_finder.js' );
var location_search           = require( './queues/queue_location_search.js' );
var natural_language          = require( './queues/queue_cloud_natural_language.js' );
var reverse_geocode           = require( './queues/queue_reverse_geocode.js' );
var new_message_notification  = require( './queues/queue_new_message_notification.js' );
var Queue = require( 'firebase-queue' );
var admin = require( 'firebase-admin' );
var serviceAccount = require( './config/app-engine-config.json' );

var option_groups = {
	'invision_image':{
		'numWorkers': 3,
		'specId': 'invision_image',
		'callback': invision_image,
	},
	'location_finder':{
		'numWorkers': 3,
		'specId': 'location_finder',
		'callback': location_finder,
	},
	'location_search':{
		'numWorkers': 3,
		'specId': 'location_search',
		'callback': location_search,
	},
	'natural_language':{
		'numWorkers': 3,
		'specId': 'natural_language',
		'callback': natural_language,
	},
	'reverse_geocode':{
		'numWorkers': 3,
		'specId': 'reverse_geocode',
		'callback': reverse_geocode,
	},
	'new_message_notification':{
		'numWorkers': 3,
		'specId': 'new_message_notification',
		'callback': new_message_notification,
	},
}

function runServer(){

	console.log('starting PDQ Queueing Server');

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		
	});

	var ref = admin.database().ref( 'queue' );
	var queues = [];

	for( key in option_groups ){
		let options = option_groups[key];
		// console.log(options)
		options.queue = new Queue(ref, options, function( data, progress, resolve, reject ){
			//resolve();
			options.callback( data, progress, resolve, reject );
		});
	};


}



module.exports.runServer = runServer;