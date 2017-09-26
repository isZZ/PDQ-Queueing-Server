var Language = require('@google-cloud/language');
var natural_language = require( '../helpers/natural_language.js' );
var fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, '..', 'config', 'app-engine-config.json');

let config = {
	projectId: configPath['project_id'],
	keyFilename: configPath
}

const language = Language(config);
const admin = require( 'firebase-admin' );
// const Language = gcloud.language;
// const language = Language();

var Queue = function( data, progress, resolve, reject ) {
	console.log('data');
	// Do some work
	progress(50);

	let document =  language.document( data.message );

	document.annotate().then(function( languageData ) {

		console.log(languageData);

		let obj = languageData[1];
		let entities = obj.entities;
		let documentSentiment = obj.documentSentiment;
		let language = obj.language;
		let sentences = obj.sentences;
		let UID = data.UID;
		let groupId = data.groupId;
		let promises = [];
		var db = admin.database();
		let feedItemRef = db.ref('groupFeed/'+groupId).push();
		let feedData = data;
		feedData.type = 'text';

		if(typeof(entities) !== 'undefined'){
			for(let key in entities){
				var entity = entities[key];
				let type = entity.mentions[0].type;
				let name = entity.name;
				if( typeof(entity.mentions !== 'undefined') && entity.mentions[0] && entity.mentions[0].type == 'PROPER' ){
					entity.message = data.message;
					entity.groupId = groupId;
					entity.score = natural_language.getScoreFromSentences( sentences, entity );
					entity.magnitude = natural_language.getMagnitudeFromSentences( sentences, entity );
					promises.push( promises.push( db.ref('userMeta/'+UID+'/userLanguage/'+entity.type+'/'+name).push(entity) ) );
				}
			}
			feedData.entities = entities;
		}

		if(typeof(documentSentiment) !== 'undefined'){
			feedData.documentSentiment = documentSentiment;
		}

		if(typeof(language) !== 'undefined'){
			feedData.language = language;
		}

		if(typeof(sentences) !== 'undefined'){
			feedData.sentences = sentences;
		}

		let feedItemPromise = feedItemRef.set(feedData);
		promises.push(feedItemPromise);

		if(promises.length){
			Promise.all(promises).then(function(){
				resolve();
			});
		}else{
			resolve();
		}

	})
	.catch(function( error ){
		console.log( error )
		reject( error.message )
	})
}

module.exports = Queue;