// Parse Config
Parse.initialize("J5OJzQnINKZWaRrek8xt")
Parse.serverURL = 'http://www.tailortags.com/parse'
var ClothingType = Parse.Object.extend("Clothing_Type")
var ClothingImage = Parse.Object.extend("AI_ClothingType_Image")
var SurveyReponse = Parse.Object.extend("AI_SurveyResponse")


// Vars
var clothingTypes = []
var weatherConditions = ["sun", "clouds", "rain", "snow"]
var weatherConditionIcons = {
  "sun" : "☀️",
  "clouds": "⛅",
  "rain": "🌧",
  "snow": "❄️"
}

var clothingType
var temperature
var weatherCondition


// Main
queryClothingTypes()


// Functions
function queryClothingTypes() {
  var query = new Parse.Query(ClothingType)
  query.find({
    success: function(results) {
      clothingTypes = results
      generateQuestion()
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message)
    }
  })
}

function generateQuestion() {
  showPreloader()
  generateRandomClothing()
  setImageForClothing(clothingType)
  generateRandomTemp()
  generateRandomWeather()
}

function generateRandomClothing() {
  if (clothingTypes.length > 0) {
    var random = Math.floor((Math.random() * clothingTypes.length) + 0)
    
    clothingType = clothingTypes[random]
  }
}

function generateRandomTemp() {
  var random = Math.floor((Math.random() * 38) + -15)
  $(".temperature").text(random + " °C")

  temperature = random
}

function generateRandomWeather() {
  var random = Math.floor((Math.random() * weatherConditions.length) + 0)
  $(".weatherCondition").text(weatherConditions[random])

  weatherCondition = weatherConditions[random]
}

function setImageForClothing(randomClothing) {
  var query = new Parse.Query(ClothingImage)
  query.equalTo("clothingType", randomClothing);
  query.find({
    success: function(results) {
      setClothingImage(results[0])
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message)
    }
  })
}

function setClothingImage(clothingImage) {
  $(".clothingImage")[0].src = clothingImage.get("image").url()
}

function showPreloader() {
  $(".clothingImage")[0].src = "img/preloader.gif"
}

function recordYes() {
  var response = new SurveyReponse()
  response.set("clothingType", clothingType)
  response.set("temperature", temperature)
  response.set("weatherCondition", weatherCondition)
  response.set("wouldWear", true)

  response.save(null, {
    success: function() {
      generateQuestion()
    },
    error: function(gameScore, error) {
      console.log('Failed to create new object, with error code: ' + error.message);
    }
  })
}

function recordNo() {
  var response = new SurveyReponse()
  response.set("clothingType", clothingType)
  response.set("temperature", temperature)
  response.set("weatherCondition", weatherCondition)
  response.set("wouldWear", false)

  response.save(null, {
    success: function() {
      generateQuestion()
    },
    error: function(gameScore, error) {
      console.log('Failed to create new object, with error code: ' + error.message);
    }
  })
}

