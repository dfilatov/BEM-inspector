chrome.extension.onConnect.addListener(function(portForDevTools) {
    chrome.tabs.getSelected(null, function(tab) {
        var portForContent = chrome.tabs.connect(tab.id);
        portForDevTools.onMessage.addListener(function(msg) {
            portForContent.postMessage(msg);
        });
        portForContent.onMessage.addListener(function(msg) {
            portForDevTools.postMessage(msg);
        });
    });
});