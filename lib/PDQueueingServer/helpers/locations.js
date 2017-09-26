var _ = require('lodash');
var geolib = require('geolib');

function userLocationMeta(latitude, longitude, results){
   let filteredResults = {};
   var results = removeLocationsTypeTwo(results);
   if(results){
      results = orderResultsByDistance(latitude, longitude, results);
      //Remove all but closest result
      let closestResult = []
      closestResult.push(results[0]);
      results = parseLocations(results);
      filteredResults = results;
   }
   return filteredResults;
}

function orderResultsByDistance(latitude, longitude, resultsArray){
	latlonArr = [];
	for(let i = 0; resultsArray.length > i; i++){
		let result = resultsArray[i];
		result.latitude  = result.geometry.location.lat;
		result.longitude = result.geometry.location.lng;
	}
	let sortedResultsArray = geolib.orderByDistance({latitude, longitude}, resultsArray);

   for(let index in sortedResultsArray){
      sortedResultsArray[index] = resultsArray[sortedResultsArray[index].key];
   }

	return sortedResultsArray;
}

function parseLocations(results){
	locationTypeObject = {};
	for(let key in results){
		let result = results[key];
		locationTypeObject = _.merge(locationTypeObject, parseLocationType(result));
	}
   return locationTypeObject
}

function removeLocationsTypeTwo(results){
   let filteredResults = [];
	for(let key in results){
      let result = results[key];
      let types = result.types;
      let filteredTypes = [];
      filteredTypes = types.filter(function(value){
         if(placeTypeOne.includes(value)){
            return value;
         }
      })
      if(filteredTypes.length){
         result.types = filteredTypes;
         filteredResults.push(result);
      }
	}
   return filteredResults;
}

function parseLocationType(result){
	let resultsByType = {};
	let types = result.types;
	for(let key in types){
		let type = types[key];
		let place_id = result.place_id;
		let resultObj = {};
		resultObj[place_id] = result;
		resultsByType[type] = resultObj;
	}
	return resultsByType;
}

const placeTypeOne = [
'accounting',
'airport',
'amusement_park',
'aquarium',
'art_gallery',
'atm',
'bakery',
'bank',
'bar',
'beauty_salon',
'bicycle_store',
'book_store',
'bowling_alley',
'bus_station',
'cafe',
'campground',
'car_dealer',
'car_rental',
'car_repair',
'car_wash',
'casino',
'cemetery',
'church',
'city_hall',
'clothing_store',
'convenience_store',
'courthouse',
'dentist',
'department_store',
'doctor',
'electrician',
'electronics_store',
'embassy',
'establishment',
'finance',
'fire_station',
'florist',
'food',
'funeral_home',
'furniture_store',
'gas_station',
'general_contractor',
'grocery_or_supermarket',
'gym',
'hair_care',
'hardware_store',
'health',
'hindu_temple',
'home_goods_store',
'hospital',
'insurance_agency',
'jewelry_store',
'laundry',
'lawyer',
'library',
'liquor_store',
'local_government_office',
'locksmith',
'lodging',
'meal_delivery',
'meal_takeaway',
'mosque',
'movie_rental',
'movie_theater',
'moving_company',
'museum',
'night_club',
'painter',
'park',
'parking',
'pet_store',
'pharmacy',
'physiotherapist',
'place_of_worship',
'plumber',
'police',
'post_office',
'real_estate_agency',
'restaurant',
'roofing_contractor',
'rv_park',
'school',
'shoe_store',
'shopping_mall',
'spa',
'stadium',
'storage',
'store',
'subway_station',
'synagogue',
'taxi_stand',
'train_station',
'transit_station',
'travel_agency',
'university',
'veterinary_care',
'zoo'];


const placeTypeTwo = [
'administrative_area_level_1',
'administrative_area_level_2',
'administrative_area_level_3',
'administrative_area_level_4',
'administrative_area_level_5',
'colloquial_area',
'country',
'establishment',
'finance',
'floor',
'food',
'general_contractor',
'geocode',
'health',
'intersection',
'locality',
'natural_feature',
'neighborhood',
'place_of_worship',
'political',
'point_of_interest',
'post_box',
'postal_code',
'postal_code_prefix',
'postal_code_suffix',
'postal_town',
'premise',
'room',
'route',
'street_address',
'street_number',
'sublocality',
'sublocality_level_4',
'sublocality_level_5',
'sublocality_level_3',
'sublocality_level_2',
'sublocality_level_1',
'subpremise'];

module.exports.userLocationMeta = userLocationMeta;
module.exports.orderResultsByDistance = orderResultsByDistance;
module.exports.parseLocations = parseLocations;
module.exports.removeLocationsTypeTwo = removeLocationsTypeTwo;
module.exports.placeTypeOne = placeTypeOne;
module.exports.placeTypeTwo = placeTypeTwo;