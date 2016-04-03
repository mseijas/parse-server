
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

	var query = new Parse.Query("Clothing")
	query.equalTo("beaconMinor", beaconMinor)
	query.matchesQuery("brand", brandQuery)

	query.include("brand")
    query.include("category")
    query.include("colorType")
    query.include("colorType.category")
    query.include("colors")
    query.include("season")
    query.include("season.type")

	query.find({
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