const VIDEO_URL = '//v.mover.uz/';
var fullVideoUrl = "";

var qualityMap = {
	"240p": "_s", 
	"360p": "_m", 
	"480p": "_b", 
	"720p": "_h"
};

var currentTab = false;
var isOverHttps = false;

function getVideoId(url) {
	console.log(`Extracting the video id from ${url}...`)
	var needleLen = 0
	
	if (url.lastIndexOf("https", 0) === 0) {
		isOverHttps = true
	}
	
	var needleLen = isOverHttps 
		? "https://mover.uz/watch/".length
		: "http://mover.uz/watch/".length
	
	fullVideoUrl = isOverHttps
		? "https:" + VIDEO_URL
		: "http:" + VIDEO_URL
	
	var videoId = url.substr(needleLen)

	if (videoId.lastIndexOf("/") > 0) {
		videoId = videoId.substr(0, videoId.length-1)
	}

	console.log(`Video id = ${videoId}`)
	return videoId
}

async function pingURI(uri) {
	return await new Promise(resolve => {
		chrome.runtime.sendMessage({contentScriptQuery: "checkUrl", url: uri}, result => {
			resolve(result)
		})
	});
}

async function checkVideo(url, qualitySupportMap, quality) {
	console.log(`Checking quality [${quality}] => ${url}`)

	let exist = await pingURI(url)
	
	if (exist) {
		console.log(`Quality [${quality}] is supported`)
	} else {
		console.log(`Quality [${quality}] isn't supported`)
	}

	qualitySupportMap[quality] = exist
}

async function getVideoQualityPrefixes(videoId) {
	console.log("Checking all the possible video qualities by pinging specific url...")

	var qualitySupportMap = {}

	await Promise.all(Object.entries(qualityMap).map(async ([quality, postfix]) => {
		await checkVideo(`${fullVideoUrl}${videoId}${postfix}.mp4`, qualitySupportMap, quality)
	}))
	
	return qualitySupportMap
}

async function addDownloadButton() {
	let currentPageURI = window.location.href
	
	// check current page
	if (currentPageURI.indexOf("mover.uz/watch/") == -1)
		return
	
	let videoId = getVideoId(currentPageURI)
	
	// check video quality types availability
	let qualitySupportMap = await getVideoQualityPrefixes(videoId)
	// build elements html
	var qualityListHTML = '<span>Скачать: '
	
	var filtered = Object.entries(qualitySupportMap)
		.filter(([_, v]) => v)
		.map(x => x[0])
	var filteredArrayLength = filtered.length

	if (!filteredArrayLength) {
		console.log(`No supported video qualities`)
		return;
	}

	console.log(`Quality support: ${filtered}`)

	let btnClass = "btn btn-medium btn-blue"

	filtered.forEach(quality => {
		var prefix = qualityMap[quality]
		
		var videoUrl = fullVideoUrl + videoId + prefix + ".mp4"
		
		qualityListHTML += `<a class="${btnClass}" href="${videoUrl}" download>${quality}</a>`
	});
	
	qualityListHTML += '</span><div class="clmar3"></div>'

	console.log("Searching the element to add our buttons after...")

	var statistics = document.querySelector("span.statistics")
	console.log(`Our element is ${statistics.tagName}`)

	if (!statistics)
		return
	
	statistics.insertAdjacentHTML('afterend', qualityListHTML)
	console.log(`Download videos buttons added`)
}

addDownloadButton()