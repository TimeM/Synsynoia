var startTime = null; // when site was first visited
var curTabId = null; // current tab id
var curSite = null; // the site base url


// Initialize storage variables and check for activity of tabs/windows
function init() {
	console.log("Initialize");
	// Need to check local storage if it exists
	/*if(!localStorage.siteList) {
		localStorage.siteList = JSON.stringify({});
	}*/
	//alert(localStorage.siteList);
	localStorage.clear();
	//localStorage.removeItem("siteList");
	//chrome.cookies.remove({"url": "http://192.185.184.192/~rgbastud/timem.github.io/", "name": "SiteDetailsStr"}, function("SiteDetailsStr") { console.log("SiteDetailsStr"); });
	localStorage.siteList = JSON.stringify({});
	//alert(localStorage.siteList);
	
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
	// As per https://developer.chrome.com/extensions/tabs#method-query
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
		
		//Getting timespect document coockie in background.js starts - Mahesh
		chrome.cookies.get({"url": 'http://192.185.184.192/~rgbastud/timem.github.io/', "name": 'eventTimeTrackArrStr'}, function(cookie) {
            arrayString = cookie.value;
			var eventTimeTrackArrExt = JSON.parse(decodeURIComponent(arrayString));
            
			chrome.cookies.get({"url": 'http://192.185.184.192/~rgbastud/timem.github.io/', "name": 'currentLap'}, function(cookie) {
				curLap = cookie.value;
				//console.log("Cookie Array-["+eventTimeTrackArrExt+"]");
				//console.log("Current Lap-["+curLap+"]");
				//console.log(eventTimeTrackArrExt[curLap][4]);
				eventTimeTrackArrExt[curLap][4] = "SocialInProgress";
				//console.log(eventTimeTrackArrExt[curLap][4]);
				var arrString = JSON.stringify(eventTimeTrackArrExt);
				chrome.cookies.set({"name":"eventTimeTrackArrStr","url":"http://192.185.184.192/~rgbastud/timem.github.io/assignments.html","value":arrString},function (cookie){
					console.log("Cookie value changed for social tracking");
				});
			})
        });
		
		chrome.cookies.get({ url: 'http://192.185.184.192/~rgbastud/timem.github.io/', name: 'activeLapExt' },
		  function (cookie) {
			if (cookie) {
			  var checkStatusString = unescape(cookie.value);
			  var tmpArr = checkStatusString.split("~|~");
			  console.debug("Button Status in Extension - " + tmpArr[3]);
			  if(tmpArr[1]=="StartStop" && tmpArr[3]=="InProcess"){
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
			  }else if(tmpArr[3]=="Ended"){
				  localStorage.clear();
			  }
			}
		});
		//Getting timespect document coockie in background.js ends - Mahesh
		
		//site list cookie starts here
		  var siteList = JSON.parse(localStorage.siteList);
		  // Create sorted list
		  var sortedSites = new Array();
		  // Generate sorted list
		  for (theSite in siteList) {
		   sortedSites.push([theSite, siteList[theSite]]);
		  }
		  // Sort sites by time
		  sortedSites.sort(function(a, b) {return b[1] - a[1];});
		
		  
		  // Store all details in coockies 
		  var SiteDetStr = JSON.stringify(sortedSites)
			chrome.cookies.set({"name":"SiteDetailsStr","url":"http://192.185.184.192/~rgbastud/timem.github.io/assignments.html","value":SiteDetStr},function (cookie){
				console.log(JSON.stringify(cookie));
			});
		//site list cookie ends here
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
function updateTime(theSite, timeSeconds) {
	console.log("Updating time " + theSite);
	// get JSON file
	//var sites = JSON.parse(localStorage.siteList);
	// Check to see if site exists already, if not save site and set time to 0.
	if(localStorage.siteList!=null){
		sites = JSON.parse(localStorage.siteList);
	}else{
		sites[theSite] = 0;
	} 

	// Update site by adding the number of seconds spent
	sites[theSite] = sites[theSite] + timeSeconds;
	
	//updating time spent on social sites in lap array starts - Mahesh
	var urlParts = theSite.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/);
	var urlParts1 = urlParts[0].split(".");
	var siteDomain = urlParts1[0];
	var trackingSites = 'facebook,yahoo,youtube,twitter,instagram,tumblr,dailymotion,pinterest,vine';
	console.log(siteDomain+"::"+trackingSites.indexOf(siteDomain));
	if(trackingSites.indexOf(siteDomain) != -1){
		chrome.cookies.get({"url": 'http://192.185.184.192/~rgbastud/timem.github.io/', "name": 'eventTimeTrackArrStr'}, function(cookie) {
            arrayString = cookie.value;
			var eventTimeTrackArrExt = JSON.parse(decodeURIComponent(arrayString));
            
			chrome.cookies.get({"url": 'http://192.185.184.192/~rgbastud/timem.github.io/', "name": 'currentLap'}, function(cookie) {
				curLap = cookie.value;
				console.log("Time spent - Before:"+eventTimeTrackArrExt[curLap][5]);
				eventTimeTrackArrExt[curLap][5] = parseInt(eventTimeTrackArrExt[curLap][5])+timeSeconds;
				console.log("Time spent - After:"+eventTimeTrackArrExt[curLap][5]);
				var arrString = JSON.stringify(eventTimeTrackArrExt);
				chrome.cookies.set({"name":"eventTimeTrackArrStr","url":"http://192.185.184.192/~rgbastud/timem.github.io/assignments.html","value":arrString},function (cookie){
					console.log("Time spent on SS added in the Lap Arrap");
				});
			})
        });		
	}
	//updating time spent on social sites in lap array ends - Mahesh
	
	console.log("Updating time spent - " + timeSeconds);

	// Write file as JSON
	console.log("Updating time - writing file");
	localStorage.siteList = JSON.stringify(sites);
}


init();