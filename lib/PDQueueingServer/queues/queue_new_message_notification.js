var admin = require( 'firebase-admin' );

var Queue = function( data, progress, resolve, reject ) {
	let db = admin.database();
	let conversationId = data.conversationId;
	let usersObj = {};
	let senderUID = data.UID;
	let message = data.message;
	let messageType = data.messageType;

	// Do some work
	progress(50);

	if(conversationId){
		db.ref('conversationsMembers/'+conversationId).once('value').then((dataSnapshot) => {
				let conversationMembers = dataSnapshot.val();

				if(Object.keys(conversationMembers).length < 2){
					resolve();
				}

				//Security Check
				if(!conversationMembers[senderUID]){
					console.error(new Error(conversationId+' was denied access to notifications for conversation '+conversationId));
					reject(conversationId+' was denied access to notifications for conversation '+conversationId);
				}

				db.ref('users/'+senderUID+'/profile/username').once('value').then((dataSnapshot)=>{
					let username = dataSnapshot.val();
					let reads = []

					for(let key in conversationMembers){
						let promise = db.ref('fcmTokens/'+key+'/token').once('value').then((dataSnapshot)=>{
							return dataSnapshot.val();
						}, (error)=>{
							console.error(new Error(error));
						});
						reads.push(promise);
					}

					Promise.all(reads).then((registrationTokens)=>{
						//Clean results
						registrationTokens = registrationTokens.filter(n=>n);

						if(registrationTokens){
							var notification = {
								notification: {
							    title:(messageType == 'image')?`Image received from ${username}`:`Message received from ${username}`,
							    body:(messageType == 'image')?"Click here to view the image":message,
								sound: "default",
								"click_action": "fcm.ACTION.HELLO"
  							},
								data:{
									type: "NEW_MESSAGE",
									conversationId: conversationId
								}
							};

							admin.messaging().sendToDevice(registrationTokens, notification)
							.then(function(response){
								if(response.results){
									console.error(new Error(response.results[0].error));
								}
								resolve()
							})
							.catch(function(error) {
								reject(error);
							});
						}else{
							resolve()
						}
					}).catch(error => {reject(error)});

					// getFCMTokens(conversationMembers).then(function (results) {
					// 	console.log('RESULTS');
					// 	console.log(results);
					//   // results is an array of the values stored in a.json and b.json
					// }, function (error) {
					// 	console.log('error');
					// 	console.log(error);
					//   // If any of the files fails to be read, err is the first error
					// });

					
					//db.ref('users/'+senderUID+'/'+profile+'/'+username).once()


					// let payload = {
					// 	data: {
					// 		score: "850",
					// 		time: "2:45"
					// 	}
					// }

					// // Send a message to the devices corresponding to the provided
					// // registration tokens.
					// admin.messaging().sendToDevice(registrationTokens, payload)
					// .then(function(response) {
					// 	console.log("Successfully sent message:", response);
					// })
					// .catch(function(error) {
					// 	console.log("Error sending message:", error);
					// });

				}).catch((error)=>{
					reject('Message sender username not found');
				});

			}).catch((error)=>{
				reject(error);
			})
	}

	//resolve();

	// }).catch(function( error ){
	// 	reject( JSON.stringify( error.message ) )
	// });
}

module.exports = Queue;