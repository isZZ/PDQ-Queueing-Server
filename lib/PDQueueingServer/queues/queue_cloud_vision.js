var Vision = require('@google-cloud/vision');
var Storage = require('@google-cloud/storage');
var fs = require('fs');
var path = require('path');
var configPath = path.join(__dirname, '..', 'config', 'app-engine-config.json');
let config = {
	projectId: configPath['project_id'],
	keyFilename: configPath
}
const visionClient = Vision(config);
const storage = Storage(config);
var admin = require( 'firebase-admin' );

//Detection Types

var types = [
	 'face',
	 'label',
	 'landmark',
	 'logo',
	 'text'
];

var Queue = function( data, progress, resolve, reject ) {

	// Do some work
	progress(50);
	let fileName = data.image.fullPath;
	let UID = data.UID;
	let groupId = data.groupId;
	let conversationId = data.conversationId;
	let db = admin.database();
	let promises = [];

	const storageBucket = config.storageBucket;

	setTimeout(function(){

	visionClient.detect( storage.bucket( storageBucket ).file( fileName ), types ).then( function( imageData ){

		let {logos, landmarks, faces, text, labels} = imageData[0];
		let promises = [];
		let feedItemRef = db.ref('groupFeed/'+groupId).push();
		let feedData = data;
		feedData.type = 'image';


		console.log('groupId', groupId);
		console.log(typeof('logos', logos));
		console.log(typeof('landmarks', landmarks));
		console.log(typeof('faces', faces));
		console.log(typeof('text', text));
		console.log(typeof('labels', labels));
		console.log('imageData', imageData);

		if(typeof(logos) == "object" && logos.length > 0){
			for(let key in logos){
				let promise = db.ref('userMeta/'+UID+'/userImage/LOGOS/'+logos[key]+'/imagePaths').push(data);
				promises.push(promise);
			}
			feedData.logos = logos;
		}

		if(typeof(landmarks) == "object" && landmarks.length > 0){
			for(let key in landmarks){
				let promise = db.ref('userMeta/'+UID+'/userImage/LANDMARKS/'+landmarks[key]+'/imagePaths').push(data);
				promises.push(promise);
			}
			feedData.landmarks = landmarks;
		}

		if(typeof(text) == "object" && text.length > 0){
			// for(let key in text){
			// 	let promise = db.ref('userMeta/'+UID+'/userImage/LANDMARKS/'+landmarks[key]+'/imagePaths').push(data);
			// 	promises.push(promise);
			// }
			feedData.imageText = text;
		}

		if(typeof(faces) == "object" && faces.length > 0){
			// for(let key in text){
			// 	let promise = db.ref('userMeta/'+UID+'/userImage/LANDMARKS/'+landmarks[key]+'/imagePaths').push(data);
			// 	promises.push(promise);
			// }
			feedData.faces = faces;
		}

		if(typeof(labels) == "object" && labels.length > 0){
			// for(let key in text){
			// 	let promise = db.ref('userMeta/'+UID+'/userImage/LANDMARKS/'+landmarks[key]+'/imagePaths').push(data);
			// 	promises.push(promise);
			// }
			feedData.labels = labels;
		}

		console.log('feedata', feedData);
		let feedItemPromise = feedItemRef.set(feedData);
//groupFeed.undefined.-Kit6hoyAwbsIZWzos5r.0.undefined
		promises.push(feedItemPromise);

		if(promises.length>0){
			Promise.all(promises).then(function(){
				resolve();
			});
		}else{
			resolve()
		}


	}).catch(function( error ){
		reject( JSON.stringify( error.message ) )
	});

	}, 2000);
}

module.exports = Queue;