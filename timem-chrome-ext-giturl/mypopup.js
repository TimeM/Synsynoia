$(document).ready(function() {
  uname = readCookie("usernameext");
  //alert(uname);
  if(uname != null && uname!=""){
	  chrome.cookies.set({"name":"username","url":"http://timem.github.io/assignments.html","value":uname},function (cookie){
			console.log(username);
	 });
	  
	  var opHtml = '<center><p><b>Welcome to TimeM.</b></p></center><div class="welcomeMsg">'+uname+'</div><div><input id="gotoAssign" type="button" value="My Assignments" name="GotoSubmit" class="btnsbmit"><input id="plogOut" type="button" value="Logout" name="Logout" class="btnsbmit"></div>';
	  $('#containerMain').html(opHtml);
	  
	  $('#gotoAssign').on('click', function() {
			//console.log("User wants to sign up!");
			var newUrl = "http://timem.github.io/assignments.html";
			chrome.tabs.create({url: newUrl});
		});
	  $('#plogOut').on('click', function() {
			//console.log("User wants to sign up!");
			document.cookie="usernameext=";
			$('#containerMain').html('<form name = "myform"><p><center><i class ="ion-locked" style= "font-size: 30px;"></i></center><center>Login:</center><input label="Email" id="username" type="text" name="username" placeholder ="PaulG" class="Emailwrap"></input><br/><br/><center>Password:</center><input label="***********" id="password" type="password" name="pword" placeholder="********"  class="Passwordwrap"><input id="signIn" type="button" value="Sign In" name="Submit" class="btnsbmit"></p></form><div id="containersignUp"> <a href="http://timem.github.io/registration.html" id="signUp"><center>Sign Up!</center></a></div>');
			
			//Session ended and saving end time to parse
			Parse.initialize("LcQYRvseB9ExXGIherTt1v2pw2MVzPFwVXfigo11", "F5enB5XfOfqo4ReAItZCkJVxOY76hoveZrOMwih9");
					
			var query = new Parse.Query("LoginDetails");
			query.equalTo("UserName", uname);
			query.descending("SessionStartedOn");
			query.first({
			   success: function(result){
					var currentSessionObjId = result.id;
					var lapUpdateClass = Parse.Object.extend("LoginDetails");
					var lapUpdate = new lapUpdateClass();
					lapUpdate.id = currentSessionObjId;
					e = new Date().getTime();
					lapUpdate.set("SessionEndedOn",e);
					// Save
					lapUpdate.save(null, {
					  success: function(lapUpdate) {
						// Saved successfully.
						console.log('Session ended and saved successfully');						
						
					  },
					  error: function(point, error) {
						// The save failed.
						console.log('Session ended but not saved.');
					  }
					});
					
			   },
			   error: function(){
				   console.log('Parse Error');
			   },
			
			})			
			
			//Session ended and saving end time to parse
			
			//changing url to home after logout
			chrome.tabs.query({url: "http://timem.github.io/assignments.html"}, function(tabs) {
				var tabURL = tabs[0].url;
				chrome.tabs.update(tabs[0].id, {url: "http://timem.github.io/?logout"});
			});
		});
	  
  }
  
  // FUNCTION FOR SIGNING IN
  $('#signIn').on('click', function() {
	Parse.initialize("LcQYRvseB9ExXGIherTt1v2pw2MVzPFwVXfigo11", "F5enB5XfOfqo4ReAItZCkJVxOY76hoveZrOMwih9");
    console.log("check");
    console.log("username: " + $('#username').val());
    console.log("password: " + $('#password').val());

    var username = $('#username').val();
    var password = $('#password').val();

    if(username.length < 0) {
      alert("Please type in your username.");
    }
    if(password.length < 0) {
      alert("Please type in your password");
    }
    authenticateUser(username, password);
  });

  var counter = 5;
  var authenticateUser = function(username, password) {
    Parse.User.logIn(username, password, {
      success: function() {
        // If user inputs correct information
        console.log("Correct!!!");
        document.cookie="usernameext=" + username;
		document.cookie="username=" + username;
		chrome.cookies.set({"name":"username","url":"http://timem.github.io/assignments.html","value":username},function (cookie){
			console.log(username);
		});
		chrome.cookies.set({"name":"username","url":"http://timem.github.io/load_timer.html","value":username},function (cookie){
			console.log(username);
		});
		
	  chrome.cookies.set({"name":"showSettings","url":"http://timem.github.io/assignments.html","value":"1"},function (cookie){
			console.log("Show Settings Initialised");
	 });		
		
		//Create record for parse loginDetails
		var blankObj = JSON.stringify({"buttonMode":"","lapStatus":"","startTime":0});
		var objLapData = [{"title":"Blank","timeSpent":0,"lapStartTime":0}];
		var blankObjLapData = JSON.stringify(objLapData);
		var trackingSites = {facebook:0, yahoo:0, youtube:0, twitter:0,instagram:0,tumblr:0,dailymotion:0,pinterest:0,vine:0};
		trackingSitesString = JSON.stringify(trackingSites);
		var loginDetailsClass = Parse.Object.extend("LoginDetails");
		var loginDetails = new loginDetailsClass();
		n = new Date().getTime();
		loginDetails.set("UserName",username);
		loginDetails.set("SessionStartedOn",n);
		loginDetails.set("LapData",blankObjLapData);
		loginDetails.set("LastLapDetails",blankObj);
		loginDetails.set("SocialSitesTime",trackingSitesString);
				
		loginDetails.save(null,{
		  success:function(loginDetails) { 
			 console.log(loginDetails.id);
		  },
		  error:function(error) {
			response.error(error);
		  }
		});

		var outputDiv = document.getElementById("containerMain");
		outputDiv.innerHTML = username;
        var newUrl = "http://timem.github.io/assignments.html";
        chrome.tabs.create({url: newUrl});
      },
      error: function() {
        //alert("Incorrect Password.");
        //If user inputs incorrect information
        counter--;
        if(counter == 0) {
          alert("You have exceeded the limit. Please make a new account!");
          var newUrl = "http://timem.github.io/registration.html";
          chrome.tabs.create({url: newUrl});
        } else {
          alert("Incorrect Password. You have " + counter + " tries left!");
        }
      }
     });
  }

  // FUNCTION FOR SIGNING UP
  $('#signUp').on('click', function() {
    console.log("User wants to sign up!");
    var newUrl = "http://timem.github.io/registration.html";
    chrome.tabs.create({url: newUrl});
  });
});

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function sendToAssignment(){
	var newUrl = "http://timem.github.io/registration.html";
    chrome.tabs.create({url: newUrl});
}