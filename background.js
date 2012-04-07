chrome.extension.onConnect.addListener(function(portForDevTools) {
    chrome.tabs.getSelected(null, function(tab) {
        var portForContent = chrome.tabs.connect(tab.id);
        portForDevTools.onMessage.addListener(function(msg) {
            console.log('from dev', msg);
            portForContent.postMessage(msg);
        });
        portForContent.onMessage.addListener(function(msg) {
            console.log('from content', msg);
            portForDevTools.postMessage(msg);
        });
    });
});