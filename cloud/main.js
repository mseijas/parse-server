
var User = Parse.Object.extend("_User")
var Clothing = Parse.Object.extend("Clothing")
var ClothingCategory = Parse.Object.extend("Clothing_Category")
var ClosetItem = Parse.Object.extend("User_ClosetItem")
var UserHistory = Parse.Object.extend("User_History")
var UserAction = Parse.Object.extend("User_Action")


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

		    var closetItem = new ClosetItem()
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

		    
		    var firstScanUserAction = UserAction.createWithoutData("DpkWSPVFRl")

			var userHistory = new UserHistory()
			userHistory.set("user", user)
			userHistory.set("clothing", clothing)
			userHistory.set("action", firstScanUserAction)

			userHistory.save()
	    },
	    error: function(error) {
			response.error(error)
	    }
	});
});

Parse.Cloud.define('markClosetItemInUse', function(request, response) {
	var userId = request.params.userId
	var closetItemId = request.params.closetItemId
	var clothingItemId = request.params.clothingItemId

	var query = new Parse.Query("User_ClosetItem")
	query.equalTo("objectId", closetItemId)

	query.find({
	    success: function(results) {
		    var closetItem = results[0]
		    if (closetItem == null) {
		    	response.error("ClosetItem could not be found in database.")
		    	return
		    }

		    closetItem.set("inUse", true)
		    closetItem.set("isActive", true)

		    closetItem.save(null, {
			    success: function() {
			      response.success()
			    },
			    error: function(error) {
			      response.error(error)
			    }
			})

		    var user = User.createWithoutData(userId)
		    var clothing = Clothing.createWithoutData(clothingItemId)
			var wornUserAction = UserAction.createWithoutData("OCzqeh0CTs")

			var userHistory = new UserHistory()
			userHistory.set("user", user)
			userHistory.set("clothing", clothing)
			userHistory.set("action", wornUserAction)

			userHistory.save()
	    },
	    error: function(error) {
			response.error(error)
	    }
	});
});

Parse.Cloud.define('markClosetItemNotInUse', function(request, response) {
	var closetItemId = request.params.closetItemId

	var query = new Parse.Query("User_ClosetItem")
	query.equalTo("objectId", closetItemId)

	query.find({
	    success: function(results) {
		    var closetItem = results[0]
		    if (closetItem == null) {
		    	response.error("ClosetItem could not be found in database.")
		    	return
		    }

		    closetItem.set("inUse", false)
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

Parse.Cloud.define('requestRandomOutfitRecommendation', function(request, response) {
	var userId = request.params.userId
	var user = User.createWithoutData(userId)

	var queryTops = queryForTopsCategory()
	var queryBottoms = queryForBottomsCategory()
	queryTops.equalTo("user", user)
	queryBottoms.equalTo("user", user)

	var allTops
	var allBottoms

	queryTops.find().then(function(tops) {
		allTops = tops
		return queryBottoms.find()
	}).then(function(bottoms) {
		allBottoms = bottoms
		return
	}).then(function() {

		var outfit1 = randomOutfitFrom(allTops, allBottoms)
		var outfit2 = randomOutfitFrom(allTops, allBottoms)
		var outfit3 = randomOutfitFrom(allTops, allBottoms)

		var result = [outfit1, outfit2, outfit3]

		response.success(result)
	}, function(error) {
		response.error(error)
	})
});

function randomOutfitFrom(tops, bottoms) {
	var randomTop = Math.floor((Math.random() * tops.length) + 0)
	var randomBottom = Math.floor((Math.random() * bottoms.length) + 0)

	return {
				"top": tops[randomTop],
				"bottom": bottoms[randomBottom]
			}
}

function queryForTopsCategory() {
	var topCategory = ClothingCategory.createWithoutData("iGYsr2ssJu")
	var clothingQuery = new Parse.Query("Clothing")

	var topCategoryQuery = new Parse.Query("Clothing_Category")
	topCategoryQuery.equalTo("objectId", "iGYsr2ssJu")
	
	clothingQuery.matchesQuery("category", topCategoryQuery)
	
	var queryTops = new Parse.Query("User_ClosetItem")
	queryTops.matchesQuery("clothing", clothingQuery)

	return queryTops
}

function queryForBottomsCategory() {
	var bottomCategory = ClothingCategory.createWithoutData("MRqdrV8K9f")
	var clothingQuery = new Parse.Query("Clothing")

	var topCategoryQuery = new Parse.Query("Clothing_Category")
	topCategoryQuery.equalTo("objectId", "MRqdrV8K9f")
	
	clothingQuery.matchesQuery("category", topCategoryQuery)
	
	var queryTops = new Parse.Query("User_ClosetItem")
	queryTops.matchesQuery("clothing", clothingQuery)

	return queryTops
}

function queryForOuterwearCategory() {
	var outerwearCategory = ClothingCategory.createWithoutData("STuDH7Llc1")
	var clothingQuery = new Parse.Query("Clothing")

	var topCategoryQuery = new Parse.Query("Clothing_Category")
	topCategoryQuery.equalTo("objectId", "STuDH7Llc1")
	
	clothingQuery.matchesQuery("category", topCategoryQuery)
	
	var queryTops = new Parse.Query("User_ClosetItem")
	queryTops.matchesQuery("clothing", clothingQuery)

	return queryTops
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}