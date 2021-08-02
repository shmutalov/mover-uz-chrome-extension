// New extension background page, fetching from a known URL and relaying data:
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.contentScriptQuery == "checkUrl") {
		fetch(request.url, { "method": "HEAD" })
			.then(r => sendResponse(r.ok))
			.catch(_ => sendResponse(false))
	}

	if (request.contentScriptQuery == "downloadUrl") {
		chrome.downloads.download({ url: request.url })
	}

	return true  // Will respond asynchronously.
})

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
	if (request.contentScriptQuery == "downloadUrl") {
		chrome.downloads.download({ url: request.url })
	}

	return true
})