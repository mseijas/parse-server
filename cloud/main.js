
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('addClosetItemForUser', function(req, res) {
	var ClothingType = Parse.Object.extend("User_ClosetItem")

	var user = request.params.user
	var beaconMajor = request.params.beaconMajor
	var beaconMinor = request.params.beaconMajor

	var brandQuery = new Parse.Query("Clothing_Brand")
	brandQuery.equalTo("beaconMajor", beaconMajor)

	var clothingQuery = new Parse.Query("Clothing")
	clothingQuery.equalTo("beaconMinor", beaconMinor)
	clothingQuery.matchesQuery("brand", brandQuery)

	query.find({
	    success: function(results) {
		    var clothing = results[0]
		    if (clothing == null) {
		    	response.error("Clothing could not be found in databse.");
		    	return;
		    }

		    var closetItem = new ClothingType()
		    closetItem.set("user", user)
		    closetItem.set("clothing", clothing)
		    closetItem.set("isActive", true)

		    closetItem.save(null, {
			    success: function(closetItem) {
			      response.success(closetItem)
			    },
			    error: function(error) {
			      response.error(error);
			    }
			})
	    },
	    error: function(error) {
			response.error(error);
	    }
	});
});