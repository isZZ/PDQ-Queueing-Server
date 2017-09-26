/* Slighly more accurate approach to gaging a respose to a PRONOUN */

function getScoreFromSentences(sentences, entity){
	let score = 0;
	let name = entity.name;
	for(let k in sentences){
		let sentence = sentences[k];
		if(sentence.text.content.indexOf(name) !== -1){
			score = sentence.sentiment.score;
		}
	}
	return score
}

function getMagnitudeFromSentences(sentences, entity){
	let magnitude = 0;
	let name = entity.name;
	for(let k in sentences){
		let sentence = sentences[k];
		if(sentence.text.content.indexOf(name) !== -1){
			magnitude = sentence.sentiment.magnitude;
		}
	}
	return magnitude
}

module.exports.getScoreFromSentences = getScoreFromSentences;
module.exports.getMagnitudeFromSentences = getMagnitudeFromSentences;