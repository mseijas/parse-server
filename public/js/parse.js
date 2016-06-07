$(document).ready(function() {
	Parse.initialize("J5OJzQnINKZWaRrek8xt")
	Parse.serverURL = 'https://tailortags.herokuapp.com/parse'

	$('form').submit(function(event) {
		event.preventDefault()
		var emailAddress = $('input[name=email]').val()
		saveUserInterest(emailAddress)
	})

	function saveUserInterest(emailAddress) {
	    var acl = new Parse.ACL()
	    acl.setPublicReadAccess(false)

	    var UserInterest = Parse.Object.extend("Marketing_UserInterest")
	    var newUser = new UserInterest()
	    newUser.setACL(acl)

	    newUser.save({email: emailAddress}, {
	      success: function(object) {
	        $('#register-title').text('Thanks for signing up!')
	        $('form').html('<p id="register-thankyou-p" style="color: #a9a9a9; margin-bottom: 28px">We’ll keep you up-to-date and let you know when Tailor is available.</p>')
	      },
	      error: function(model, error) {
	        $('#register-title').text('Oops 😕')
	        $('form').html('<p id="register-thankyou-p" style="color: #a9a9a9; margin-bottom: 28px">An error has occurred. Please try again later.</p>')
	      }
	    })
	 }
})