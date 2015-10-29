var startTime = null; // when site was first visited
var curTabId = null; // current tab id
var curSite = null; // the site base url


// Initialize storage variables and check for activity of tabs/windows
function init() {
	console.log("Initialize");
	
	if(!localStorage.siteList) {
		localStorage.siteList = JSON.stringify({});
	}
	
	// Check for activity changes
	checkActivity();
}

// Check for activity of tabs/windows and updates variables correctly
function checkActivity() {
	console.log("checkActivity initialized");
	// Check for changing tab
	chrome.tabs.onActivated.addListener(
	function(tabs) {
		curTabId = tabs.tabId;
		console.log("Tab changed - " + tabs.tabId);
		updateInfo();
		
	});
	
	// Check for tabs updating
	chrome.tabs.onUpdated.addListener(
	function(tabId, changeInfo, tab) {
		if (tabId == curTabId) {
			console.log("Tabs updated - " + tabId);
			updateInfo();
		}
	});
	
	// Query info for tabs.query
	var queryInfo = {
		active: true,
		currentWindow: true
	};
	
	// check for window focus changing (different window or closing)
	chrome.windows.onFocusChanged.addListener(
	function(windowId) {
    console.log("Detected window focus changed");
    chrome.tabs.query(queryInfo,
    function(tabs) {
		console.log("Window or Tab changed");
		// Make sure tabs is defined
		if (typeof tabs[0] != 'undefined') {
			var tab = tabs[0]; // only one active tab at a time
			curTabId = tab.id;
			updateInfo();
		}
	  });
	});	
}

// Update data about current site and times on a site
function updateInfo() {
	console.log("Running update");
	// Make sure current tab exists
	if (curTabId == null) {
		return;
	} else {
		// Get data from the current tab
		console.debug("Update - " + curTabId);
		chrome.tabs.get(curTabId, 
		function(tab) { 
			console.debug(tab);
			// Get base URL
			var theSite = getSite(tab.url);
			// Check if its valid
			if (theSite == null) {
				console.log("URL issue");
				return;
			}
			// Set site if doesnt exist yet
			if (curSite == null) {
				console.log("Setting new site - " + curSite);
				startTime = new Date();
				curSite = theSite;
				return;
			}
			// If new site, update time spent
			if (curSite != theSite) {
				var diffTimeSec = ((new Date()).getTime() - startTime.getTime()) / 1000;
				updateTime(curSite, diffTimeSec);
				curSite = theSite;
				startTime = new Date();
			}
		});
	}
}

function getSite(url) {
	var regex = /^(\w+:\/\/[^\/]+)/;
	var matches = url.match(regex);
	if (matches) {
		return matches[0];
	} else {
		return null;
	}
}

// Update the time spent on a site
function updateTime(theSite, timeSeconds,curLapObjId,curLapTimeSpent) {
	console.log("Updating time " + theSite);
	// get JSON file
	var sites = JSON.parse(localStorage.siteList);
	// Check to see if site exists already, if not save site and set time to 0.
	if (!sites[theSite]) {
		sites[theSite] = 0;
	} 

	// Update site by adding the number of seconds spent
	sites[theSite] = sites[theSite] + timeSeconds;
	
	//updating time spent on social sites in lap array starts - Mahesh
	var urlParts = theSite.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/);
	var urlParts1 = urlParts[0].split(".");
	var siteDomain = urlParts1[0];
	var trackingSitesList = 'facebook,yahoo,youtube,twitter,instagram,tumblr,dailymotion,pinterest,vine';
	console.log(siteDomain+"::"+trackingSitesList.indexOf(siteDomain));
	if(trackingSitesList.indexOf(siteDomain) != -1){
		Parse.initialize("LcQYRvseB9ExXGIherTt1v2pw2MVzPFwVXfigo11", "F5enB5XfOfqo4ReAItZCkJVxOY76hoveZrOMwih9");
		chrome.cookies.get({"url": 'http://192.185.184.192/~rgbastud/timem.github.io/', "name": 'username'}, function(cookie) {
			usname = cookie.value;
			if(usname.indexOf("@") > 0 && usname.indexOf(".")){
				console.log("Username in background.js:"+usname);
				var query = new Parse.Query("LoginDetails");
				query.equalTo("UserName", usname);
				query.descending("SessionStartedOn");
				query.first({
				   success: function(result){
						var currentSessionObjId = result.id;
						console.log("Last Lap Details from parse-"+result.get("LastLapDetails"));
						var socialSitesTimeParse = result.get("SocialSitesTime");
						var lastActiveLap = $.parseJSON(result.get("LastLapDetails"));
						var lastButtonActiveMode = lastActiveLap.buttonMode;
						console.log("lastButtonActiveMode:"+lastButtonActiveMode);
						if(lastActiveLap.lapStatus == "InProcess"){
							var e = new Date().getTime();
							var newbandDetails = {};
							newbandDetails.title = "Study";
							var stTime = lastActiveLap.startTime;
							newbandDetails.timeSpent = e - parseInt(stTime);
							if(result.get("LapData")){
								var objLapData = $.parseJSON(result.get("LapData"));
								objLapData.push(newbandDetails);
								var objLapDataString = JSON.stringify(objLapData);
							}else{
								var objLapData = [];
								objLapData.push(newbandDetails);
								var objLapDataString = JSON.stringify(objLapData);
							}
							
							var lapUpdateClass = Parse.Object.extend("LoginDetails");
							var lapUpdate = new lapUpdateClass();
							lapUpdate.id = currentSessionObjId;
						
							lapUpdate.set("LapData",objLapDataString);
							// Save
							lapUpdate.save(null, {
							  success: function(lapUpdate) {
								// Saved successfully.
								var lastActiveLap = {};
								lastActiveLap.buttonMode = lastButtonActiveMode;
								lastActiveLap.lapStatus = "SocialInProgress";
								s = new Date().getTime();
								lastActiveLap.startTime = s;
								var tmpStringifyStr = JSON.stringify(lastActiveLap);
								
								var lapUpdateClass = Parse.Object.extend("LoginDetails");
								var lapUpdate = new lapUpdateClass();
								lapUpdate.id = currentSessionObjId;
							
								lapUpdate.set("LastLapDetails",tmpStringifyStr);
								// Save
								lapUpdate.save(null, {
								  success: function(lapUpdate) {
									// Saved successfully.
									console.log("LastLapDetails Updated Successfully");
								  },
								  error: function(point, error) {
									// The save failed.
									console.log("LastLapDetails Update failed");
								  }
								});								
								console.log("LapData Updated Successfully");	
							  },
							  error: function(point, error) {
								// The save failed.
								console.log("LapData Update failed");
							  }
							});
						}
						updateSocialTrackingArray(currentSessionObjId,socialSitesTimeParse,siteDomain,timeSeconds);						
				   },
				   error: function(){
					   console.log('Parse Error');
				   },
				
				})				
			}else{
				console.log("Username does not exists.");
			}
			
		})				
	}
	//updating time spent on social sites in lap array ends - Mahesh
	
	console.log("Updating time spent - " + timeSeconds);

	// Write file as JSON
	console.log("Updating time - writing file");
	localStorage.siteList = JSON.stringify(sites);
}

function updateSocialTrackingArray(currentSessionObjId,socialTimeParse,siteDomain,timeSeconds){
	console.log("updateSocialTrackingArray - currentSessionObjId:"+currentSessionObjId+"||socialTimeParse:"+socialTimeParse+"||siteDomain:"+siteDomain+"||timeSeconds:"+timeSeconds);
	if(typeof socialTimeParse == 'undefined' || socialTimeParse == ''){
		var trackingSites = {};
		trackingSites.facebook = 0;
		trackingSites.yahoo = 0;
		trackingSites.youtube = 0;
		trackingSites.twitter = 0;
		trackingSites.instagram = 0;
		trackingSites.tumblr = 0;
		trackingSites.dailymotion = 0;
		trackingSites.pinterest = 0;
		trackingSites.vine = 0;
		trackingSites[siteDomain] = timeSeconds;
		trackingSitesString = JSON.stringify(trackingSites);		
	}else{
		console.log("array undefined");
		trackingSites = $.parseJSON(socialTimeParse);
		trackingSites[siteDomain] = parseInt(trackingSites[siteDomain]) + parseInt(timeSeconds);
		trackingSitesString = JSON.stringify(trackingSites);
	}
	Parse.initialize("LcQYRvseB9ExXGIherTt1v2pw2MVzPFwVXfigo11", "F5enB5XfOfqo4ReAItZCkJVxOY76hoveZrOMwih9");
	var lapUpdateClass = Parse.Object.extend("LoginDetails");
	var lapUpdate = new lapUpdateClass();
	lapUpdate.id = currentSessionObjId;

	lapUpdate.set("SocialSitesTime",trackingSitesString);
	// Save
	lapUpdate.save(null, {
	  success: function(lapUpdate) {
		// Saved successfully.
		console.log("Social Time Updated Successfully");
	  },
	  error: function(point, error) {
		// The save failed.
		console.log("Social Time Update failed");
	  }
	});
}

init();