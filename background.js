// New extension background page, fetching from a known URL and relaying data:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.contentScriptQuery == "checkUrl") {
		fetch(request.url, {
			"method": "HEAD"
		})
		.then(r => {
			console.log(`${r.status} ${r.statusText}`)
			sendResponse(r.ok)
		})
		.catch(error => {
			console.log(error)
			sendResponse(false)
		})
		
		return true;  // Will respond asynchronously.
    }
})