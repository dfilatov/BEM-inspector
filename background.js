chrome.extension.onConnect.addListener(function(portForDevTools) {
    console.log('back connnected');
    chrome.tabs.getSelected(null, function(tab) {
        console.log('on get selectted');
        var portForContent = chrome.tabs.connect(tab.id);
        portForDevTools.onMessage.addListener(function(msg) {
            console.log('from dev', msg)
            portForContent.postMessage(msg);
        });
        portForContent.onMessage.addListener(function(msg) {
            console.log('from content', msg)
            portForDevTools.postMessage(msg);
        });
    });
});