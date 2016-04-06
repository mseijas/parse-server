// Parse Config
Parse.initialize("J5OJzQnINKZWaRrek8xt")
Parse.serverURL = 'https://tailortags.herokuapp.com/parse'
var ClothingType = Parse.Object.extend("Clothing_Type")
var ClothingImage = Parse.Object.extend("AI_ClothingType_Image")
var SurveyReponse = Parse.Object.extend("AI_Outsourced_Score")


// Vars
var clothingTypes = []
var tempRanges = [[-15, -5], [-6, 4], [5, 10], [11, 16], [17, 22], [22, 32], [33, 38]]
var weatherConditions = ["sunny", "cloudy", "rain", "snow"]
var weatherConditionIcons = {
  "sunny" : "/static/img/sunny.png",
  "cloudy": "/static/img/cloudy.png",
  "rain": "/static/img/rain.png",
  "snow": "/static/img/snow.png"
}

var clothingType
var temperature
var temperatureRange
var weatherCondition


// Main
queryClothingTypes()


// Functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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
  var randomTempRange = Math.floor((Math.random() * tempRanges.length) + 0)

  var minRange = tempRanges[randomTempRange][0]
  var maxRange = tempRanges[randomTempRange][1]

  var random = getRandomInt(minRange, maxRange)
  var tempC = random
  var tempF = Math.round(random * 1.8 + 32)

  $(".temperature").text(tempF + " °F\n" + tempC + " °C")

  temperature = tempC
  temperatureRange = tempRanges[randomTempRange]
}

function generateRandomWeather() {
  var random = Math.floor((Math.random() * weatherConditions.length) + 0)

  weatherCondition = weatherConditions[random]
  setWeatherConditionImage(weatherConditionIcons[weatherCondition])

  if weatherConditions[random] == snow && temperature > 0 {
    console.log("snow in summer!")
    generateQuestion()
  }
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

function setWeatherConditionImage(weatherConditionImage) {
  $(".weatherConditionImage")[0].src = weatherConditionImage
}

function setClothingImage(clothingImage) {
  $(".clothingImage")[0].src = clothingImage.get("image").url()
}

function showPreloader() {
  $(".clothingImage")[0].src = "/static/img/preloader.gif"
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
  response.set("temp", temperature)
  response.set("tempRange", temperatureRange)
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

