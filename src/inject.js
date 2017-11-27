const VIDEO_URL = '//v.mover.uz/';
var fullVideoUrl = "";

var qualityTypeNames = ["240p", "360p", "480p", "720p"];
var qualityPrefixes = ["_s", "_m", "_b", "_h"];
var currentTab = false;
var isOverHttps = false;

function getVideoId(url) {
	var needleLen = 0; 
	
	if (url.lastIndexOf("https", 0) === 0) {
		isOverHttps = true;
	}
	
	var needleLen = isOverHttps 
		? "https://mover.uz/watch/".length
		: "http://mover.uz/watch/".length;
	
	fullVideoUrl = isOverHttps
		? "https:" + VIDEO_URL
		: "http:" + VIDEO_URL;
	
	var videoId = url.substr(needleLen);

	if (videoId.lastIndexOf("/") > 0) {
		videoId = videoId.substr(0, videoId.length-1);
	}

	return videoId;
}

function pingURI(uri, ok, notOk) {
	var request = new XMLHttpRequest();  
	request.open('HEAD', uri, true);
	request.onreadystatechange = function(){
		if (request.readyState === 4){
			if (request.status === 200) {  
				ok();
			}  else {
				notOk();
			}
		}
	};
	
	request.send();
}

function checkVideo(url, qualitySupportArray, id, callback) {
	pingURI(url, 
		// ok
		function () {
			qualitySupportArray[id] = true;
			callback();
		}, 
		// not ok
		function () {
			qualitySupportArray[id] = false;
			callback();
		}
	);
}

function getVideoQualityPrefixes(videoId, callback) {
	var qualitySupportArray = [false, false, false, false];

	checkVideo(fullVideoUrl + videoId + "_s.mp4", qualitySupportArray, 0, function() {
		checkVideo(fullVideoUrl + videoId + "_m.mp4", qualitySupportArray, 1, function() {
			checkVideo(fullVideoUrl + videoId + "_b.mp4", qualitySupportArray, 2, function() {
				checkVideo(fullVideoUrl + videoId + "_h.mp4", qualitySupportArray, 3, function() {
					callback(qualitySupportArray);
				})
			})
		})
	})
}

function addDownloadButton() {
	var currentPageURI = window.location.href;
	
	// check current page
	if (currentPageURI.indexOf("mover.uz/watch/") == -1)
		return;
	
	var videoId = getVideoId(currentPageURI);
	
	// check video quality types availability
	getVideoQualityPrefixes(videoId, function (qualitySupportArray) {
		// build elements html
		var qualityListHTML = '<span>Скачать: ';
		
		var len = qualitySupportArray.length;
		var filteredArrayLength = qualitySupportArray
			.filter(function(value){return value;})
			.length;
		
		var btnClass = "btn thin";
		var btnClasses = [];
		
		if (filteredArrayLength == 1) {
			btnClasses.push(btnClass);
		} else {
			for (var id = 0; id < filteredArrayLength; id++)
			{
				if (id == 0)
					btnClasses.push(btnClass + " left");
				else if (id == filteredArrayLength-1)
					btnClasses.push(btnClass + " right");
				else
					btnClasses.push(btnClass + " middle");
			}
		}
		
		var btnId = 0;
		for (var id = 0; id < len; id++) {
			var qualitySupport = qualitySupportArray[id];
			
			if (!qualitySupport)
				continue;
			
			var quality = qualityTypeNames[id];
			var prefix = qualityPrefixes[id];
			
			var videoUrl = fullVideoUrl + videoId + prefix + ".mp4";
			
			qualityListHTML += '<a class="' + btnClasses[btnId] + '" href="' + videoUrl + '" download>' + quality + '</a>';
			
			btnId++;
		}
		
		qualityListHTML += '</span><div class="clmar3"></div>';
		
		var clmar3s = document.getElementsByClassName("clmar3");
		
		if (clmar3s.length == 0)
			return;
		
		var clmar3 = clmar3s[0];
		
		clmar3.insertAdjacentHTML('afterend', qualityListHTML);
	});
}

addDownloadButton()