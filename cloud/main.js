
var User = Parse.Object.extend("_User")
var Clothing = Parse.Object.extend("Clothing")
var ClothingType = Parse.Object.extend("User_ClosetItem")

Parse.Cloud.define('addClosetItemForUser', function(request, response) {
	var userId = request.params.userId
	var beaconMajor = request.params.beaconMajor
	var beaconMinor = request.params.beaconMinor

	var brandQuery = new Parse.Query("Clothing_Brand")
	brandQuery.equalTo("beaconMajor", beaconMajor)

	var query = new Parse.Query("Clothing")
	query.equalTo("beaconMinor", beaconMinor)
	query.matchesQuery("brand", brandQuery)

	query.find({
	    success: function(results) {
		    var clothingResult = results[0]
		    if (clothingResult == null) {
		    	response.error("Clothing could not be found in database.")
		    	return
		    }

		    var user = User.createWithoutData(userId)
		    var clothing = Clothing.createWithoutData(clothingResult.id)

		    var closetItem = new ClothingType()
		    closetItem.set("user", user)
		    closetItem.set("clothing", clothing)
		    closetItem.set("inUse", false)
		    closetItem.set("isActive", true)

		    closetItem.save(null, {
			    success: function(closetItem) {
			      response.success(closetItem)
			    },
			    error: function(error) {
			      response.error(error)
			    }
			})
	    },
	    error: function(error) {
			response.error(error)
	    }
	});
});


Parse.Cloud.define('markClosetItemInUse', function(request, response) {
	var closetItemId = request.params.closetItemId

	var query = new Parse.Query("User_ClosetItem")
	query.equalTo("objectId", closetItemId)

	query.find({
	    success: function(results) {
		    var closetItemResult = results[0]
		    if (closetItemResult == null) {
		    	response.error("ClosetItem could not be found in database.")
		    	return
		    }

		    closetItemResult.set("inUse", true)
		    closetItem.set("isActive", true)

		    closetItem.save(null, {
			    success: function() {
			      response.success()
			    },
			    error: function(error) {
			      response.error(error)
			    }
			})
	    },
	    error: function(error) {
			response.error(error)
	    }
	});
});