
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('addClosetItemForUser', function(request, response) {
	var User = Parse.Object.extend("_User")
	var ClothingType = Parse.Object.extend("User_ClosetItem")

	var userId = request.params.userId
	var beaconMajor = request.params.beaconMajor
	var beaconMinor = request.params.beaconMinor

	var brandQuery = new Parse.Query("Clothing_Brand")
	brandQuery.equalTo("beaconMajor", beaconMajor)

	var clothingQuery = new Parse.Query("Clothing")
	clothingQuery.equalTo("beaconMinor", beaconMinor)
	clothingQuery.matchesQuery("brand", brandQuery)

	clothingQuery.find({
	    success: function(results) {
		    var clothing = results[0]
		    if (clothing == null) {
		    	response.error("Clothing could not be found in database.")
		    	return;
		    }

		    var user = User.createWithoutData(userId)

		    var closetItem = new ClothingType()
		    closetItem.set("user", user)
		    closetItem.set("clothing", clothing)
		    closetItem.set("isActive", true)

		    console.log("*** Created ClosetItem ***")
		    console.log(closetItem)
		    console.log("**************************")

		    closetItem.save(null, {
			    success: function(closetItem) {
			      response.success(closetItem)
			    },
			    error: function(error) {
			      response.error(error)
			    }
			})

			response.success(results)
	    },
	    error: function(error) {
			response.error(error)
	    }
	});
});