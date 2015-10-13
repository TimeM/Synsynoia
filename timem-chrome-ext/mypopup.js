$(document).ready(function() {
  uname = readCookie("usernameext");
  //alert(uname);
  if(uname != null && uname!=""){
	  var opHtml = '<center><p><b>Welcome to TimeM.</b></p></center><div class="welcomeMsg">'+uname+'</div><div><input id="gotoAssign" type="button" value="My Assignments" name="GotoSubmit" class="btnsbmit"><input id="plogOut" type="button" value="Logout" name="Logout" class="btnsbmit"></div>';
	  $('#containerMain').html(opHtml);
	  
	  $('#gotoAssign').on('click', function() {
			//console.log("User wants to sign up!");
			var newUrl = "http://192.185.184.192/~rgbastud/timem.github.io/assignments.html";
			chrome.tabs.create({url: newUrl});
		});
	  $('#plogOut').on('click', function() {
			//console.log("User wants to sign up!");
			document.cookie="usernameext=";
			$('#containerMain').html('<form name = "myform"><p><center><i class ="ion-locked" style= "font-size: 30px;"></i></center><center>Login:</center><input label="Email" id="username" type="text" name="username" placeholder ="PaulG" class="Emailwrap"></input><br/><br/><center>Password:</center><input label="***********" id="password" type="password" name="pword" placeholder="********"  class="Passwordwrap"><input id="signIn" type="button" value="Sign In" name="Submit" class="btnsbmit"></p></form><div id="containersignUp"> <a href="http://timem.github.io/registration.html" id="signUp"><center>Sign Up!</center></a></div>');
			//chrome.tabs.remove({url: newUrl});
			//window.close();
		});
	  	//alert(uname);
	  	/*chrome.cookies.set({"name":"username","url":"http://192.185.184.192/~rgbastud/timem.github.io/assignments.html","value":uname},function (cookie){
			console.log(username);
			console.log(JSON.stringify(cookie));
			console.log(chrome.extension.lastError);
			console.log(chrome.runtime.lastError);
		});*/
	  //return false;
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
		chrome.cookies.set({"name":"username","url":"http://192.185.184.192/~rgbastud/timem.github.io/assignments.html","value":username},function (cookie){
			console.log(username);
		});
		chrome.cookies.set({"name":"username","url":"http://192.185.184.192/~rgbastud/timem.github.io/load_timer.html","value":username},function (cookie){
			console.log(username);
		});
		var outputDiv = document.getElementById("containerMain");
		outputDiv.innerHTML = username;
        var newUrl = "http://192.185.184.192/~rgbastud/timem.github.io/assignments.html";
        chrome.tabs.create({url: newUrl});
      },
      error: function() {
        //alert("Incorrect Password.");
        //If user inputs incorrect information
        counter--;
        if(counter == 0) {
          alert("You have exceeded the limit. Please make a new account!");
          var newUrl = "http://192.185.184.192/~rgbastud/timem.github.io/registration.html";
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
    var newUrl = "http://192.185.184.192/~rgbastud/timem.github.io/registration.html";
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
	var newUrl = "http://192.185.184.192/~rgbastud/timem.github.io/registration.html";
    chrome.tabs.create({url: newUrl});
}
