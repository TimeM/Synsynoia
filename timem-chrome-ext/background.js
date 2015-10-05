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
		// Get data from the current tab
		console.debug("Update - " + curTabId);
		chrome.tabs.get(curTabId, 
		function(tab) { 
			console.debug(tab);
			// Get base URL
			//alert(tab.url);
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
function updateTime(theSite, timeSeconds) {
	console.log("Updating time " + theSite);
	// get JSON file
	//alert('Hello World');
	var sites = JSON.parse(localStorage.siteList);
	// Check to see if site exists already, if not save site and set time to 0.
	if (!sites[theSite]) {
		sites[theSite] = 0;
	} 
	// Update site by adding the number of seconds spent
	sites[theSite] = sites[theSite] + timeSeconds;
	console.log("Updating time - " + timeSeconds);
	//alert("Updating time - " + timeSeconds);
	// Write file as JSON
	console.log("Updating time - writing file");
	localStorage.siteList = JSON.stringify(sites);
	//var siteListStr = localStorage.siteList;
	chrome.cookies.set({"name":"siteListstr","url":"http://localhost/time_m/timem-dev/dashboard.html","value":localStorage.siteList},function (cookie){
		console.log(JSON.stringify(cookie));
		console.log(chrome.extension.lastError);
		console.log(chrome.runtime.lastError);
	});
}

init();