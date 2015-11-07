// Based on Show Tabs in Process, https://developer.chrome.com/extensions/samples
function init() {
  // Read in JSON data generated from background.js
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
	chrome.cookies.set({"name":"SiteDetailsStr","url":"http://timem.github.io/assignments.html","value":SiteDetStr},function (cookie){
		console.log(JSON.stringify(cookie));
		console.log(chrome.extension.lastError);
		console.log(chrome.runtime.lastError);
	});
	//alert(SiteDetStr);
  		//var ophtml = '<div>dynamic test html</div>';
		//outputDiv.innerHTML = ophtml;
} // end of init function

document.addEventListener("DOMContentLoaded", init());