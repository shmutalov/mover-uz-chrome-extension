const VIDEO_URL = '//v.mover.uz/';
var fullVideoUrl = "";

var qualityMap = {
	"240p": "_s",
	"360p": "_m",
	"480p": "_b",
	"720p": "_h"
};

function getVideoId(url) {
	console.log(`Extracting the video id from ${url}...`)
	const u = new URL(url)
	const segments = u.pathname.split('/')
	const videoId = segments.pop() || segments.pop()

	fullVideoUrl = u.protocol + VIDEO_URL

	console.log(`Video id = ${videoId}`)
	return videoId
}

async function pingURI(uri) {
	return await new Promise(resolve => {
		chrome.runtime.sendMessage({ contentScriptQuery: "checkUrl", url: uri }, result => {
			resolve(result)
		})
	});
}

async function checkVideo(url, qualitySupportMap, quality) {
	console.log(`Checking quality [${quality}] => ${url}`)

	qualitySupportMap[quality] = await pingURI(url)
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
		.sort()

	const filteredArrayLength = filtered.length

	if (!filteredArrayLength) {
		console.log(`No supported video qualities`)
		return;
	}

	console.log(`Quality support: ${filtered}`)

	const btnClass = "btn btn-medium btn-blue"
	const extensionId = chrome.runtime.id

	filtered.forEach(quality => {
		const prefix = qualityMap[quality]
		const videoUrl = fullVideoUrl + videoId + prefix + ".mp4"

		qualityListHTML += `<a class="${btnClass}" href="#" onclick='chrome.runtime.sendMessage("${extensionId}", {contentScriptQuery: "downloadUrl", url: "${videoUrl}"}); event.preventDefault ? event.preventDefault() : event.returnValue = false;'>${quality}</a>`
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