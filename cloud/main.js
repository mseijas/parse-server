
var User = Parse.Object.extend("_User")
var Clothing = Parse.Object.extend("Clothing")
var ClothingCategory = Parse.Object.extend("Clothing_Category")
var ClosetItem = Parse.Object.extend("User_ClosetItem")
var UserHistory = Parse.Object.extend("User_History")
var UserAction = Parse.Object.extend("User_Action")
var AIPrototypeScore = Parse.Object.extend("AI_Prototype_Score")

var tempRanges = [[-15, -5], [-4, 4], [5, 10], [11, 16], [17, 22], [23, 33], [34, 38]]



// ** CLOUDCODE FUNCTIONS

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

Parse.Cloud.define('requestAIOutfitRecommendation', function(request, response) {
	var userId = request.params.userId
  var user = User.createWithoutData(userId)

  var weatherCondition = request.params.weatherCondition
  var temp = request.params.temp
  var tempRangeStringLiteral = tempRangeStringLiteralForTemp(temp)

  var queryAIScores = new Parse.Query("AI_Prototype_Score")
  queryAIScores.equalTo("weatherCondition", weatherCondition)
  queryAIScores.equalTo("tempRangeStringLiteral", tempRangeStringLiteral)

  var queryTops = queryForTopsCategory()
  var queryBottoms = queryForBottomsCategory()
  var queryOuterwear = queryForOuterwearCategory()
  queryTops.equalTo("user", user)
  queryBottoms.equalTo("user", user)
  queryOuterwear.equalTo("user", user)


  var aiScores
  var allTops
  var allBottoms
  var allOuterwear

  queryAIScores.find().then(function(scores) {
    aiScores = scores
    return queryTops.find()
  }).then(function(tops) {
    allTops = tops
    return queryBottoms.find()
  }).then(function(bottoms) {
    allBottoms = bottoms
    return queryOuterwear.find()
  }).then(function(outerwear) {
    allOuterwear = outerwear
    return
  }).then(function() {
    var suggestions = []

    for (var i = 0; i < 3; i++) {
      var newSuggestion = generateSuggestionFor(aiScores, allTops, allBottoms, allOuterwear)

      suggestions.push(newSuggestion)

      if (suggestions.length > 0) {
        for (i in suggestions) {
          var suggestion = suggestions[i]
          if (suggestion["top"].id == newSuggestion["top"].id && suggestion["bottom"].id == newSuggestion["top"].id) {
            suggestions.pop()
          }
        }
      }
    }
    
    // console.log(suggestions)
    response.success(suggestions)
    
  }, function(error) {
    response.error(error)
  })

});



// ** AI FUNCTIONS

function generateSuggestionFor(aiScores, allTops, allBottoms, allOuterwear) {
  var topScores = scoresForClosetItems(allTops, aiScores)
  var bottomScores = scoresForClosetItems(allBottoms, aiScores)
  var outerwearScores = scoresForClosetItems(allOuterwear, aiScores)

  var top = generateClothingSuggestionFrom(topScores)[0]
  var bottom = generateClothingSuggestionFrom(bottomScores)[0]
  var outerwear

  if (aiScores[0].get("tempRange")[0] >= 17) {
    var shouldOfferOuterwear = getRandomInt(0,1)
    if (shouldOfferOuterwear == 1) {
      outerwear = generateClothingSuggestionFrom(outerwearScores)[0]
    }
  }

  var suggestion = {
        "top": top,
        "bottom": bottom,
        "outerwear": outerwear
      }

  return suggestion
}

function generateClothingSuggestionFrom(scores) {
  var ranges = calculateRangesOfScores(scores)

  for (i in ranges) {
    var clothingType = ranges[i][0].get("clothing").get("type").get("name")
    var pctRange = ranges[i][3]
    // console.log(clothingType + "  -  " + pctRange)
  }

  var clothingPick = randomPickFromRanges(ranges)
  return clothingPick
}

function randomPickFromRanges(ranges) {
  var random = getRandomArbitrary(0,1)

  for (i in ranges) {
    var item = ranges[i]
    var pctRange = item[3]

    if(between(random, pctRange[0], pctRange[1])) {
      return item
    }
  }
}

function calculateSumOfScores(scores) {
  var sum = 0

  for (i in scores) {
    sum = sum + scores[i][1]
  }

  return sum
}

function calculatePctOfScores(scores) {
  var sumOfScores = calculateSumOfScores(scores)
  var pctOfScores = []

  for (i in scores) {
    var entry = scores[i]
    var item = entry[0]
    var score = entry[1]
    var pctScore = score / sumOfScores

    entry.push(pctScore)
    pctOfScores.push(entry)
  }

  return pctOfScores
}

function calculateRangesOfScores(scores) {
  var pctOfScores = calculatePctOfScores(scores)
  var ranges = []

  for (i in pctOfScores) {
    var entry = pctOfScores[i]
    var item = entry[0]
    var pct = entry[2]

    var min = 0
    if (lastEntry = ranges[ranges.length-1]) {
      min = lastEntry[3][1]
    }

    var max = min + pct

    entry.push([min, max])
    ranges.push(entry)
  }

  return ranges
}

function scoresForClosetItems(allItems, aiScores) {
  var allScores = []
  var finalScores = []

  for (i in allItems) {
    var item = allItems[i]
    var clothingTypeId = item.get("clothing").get("type").id
    var score = scoreForClothingType(clothingTypeId, aiScores)
    allScores.push([item, score])
  }

  for (j in allScores) {
    var entry = allScores[j]

    if (entry[1] != 0) {
      finalScores.push(entry)
    }
  }

  return finalScores
}

function scoreForClothingType(clothingTypeId, aiScores) {
  for (i in aiScores) {
    var score = aiScores[i]

    if (clothingTypeId == score.get("clothingType").id) {
      return score.get("score")
    }
  }
}



// ** UTILITY FUNCTIONS

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

	queryTops.include("clothing")
  	queryTops.include("clothing.type")

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

	queryTops.include("clothing")
  	queryTops.include("clothing.type")

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

	queryTops.include("clothing")
  	queryTops.include("clothing.type")

	return queryTops
}

function tempRangeStringLiteralForTemp(temp) {
  for (range in tempRanges) {
    if (between(temp, tempRanges[range][0], tempRanges[range][1])) {
      return tempRanges[range].toString()
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function between(x, min, max) {
  return x >= min && x <= max;
}