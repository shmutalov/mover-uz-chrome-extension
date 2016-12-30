const VIDEO_URL = 'http://v.mover.uz/';

var qualityTypeNames = ["240p", "360p", "480p"];
var qualityPrefixes = ["_s", "_m", "_b"];

function getVideoId(url) {
	var needleLen = "http://mover.uz/watch/".length;
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
	var qualitySupportArray = [false, false, false];

	checkVideo(VIDEO_URL + videoId + "_s.mp4", qualitySupportArray, 0, function() {
		checkVideo(VIDEO_URL + videoId + "_m.mp4", qualitySupportArray, 1, function() {
			checkVideo(VIDEO_URL + videoId + "_b.mp4", qualitySupportArray, 2, function() {
				callback(qualitySupportArray);
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
		
		for (var id = 0, len = qualitySupportArray.length; id < len; id++) {
			var qualitySupport = qualitySupportArray[id];
			
			if (!qualitySupport)
				continue;
			
			var quality = qualityTypeNames[id];
			var prefix = qualityPrefixes[id];
			
			var videoUrl = VIDEO_URL + videoId + prefix + ".mp4";
			
			var btnClass = "btn thin";
			
			if (len > 1) {
				if (id == 0) {
					btnClass += " left";
				} else if (id == len - 1) {
					btnClass += " right";
				} else if (len > 1) {
					btnClass += " middle";
				}
			}
			
			qualityListHTML += '<a class="' + btnClass + '" href="' + videoUrl + '" download>' + quality + '</a>';
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