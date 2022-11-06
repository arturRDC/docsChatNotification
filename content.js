async function getAvatar(url) {
    const response = await fetch(url);
    const blob = await response.blob();

    const avatarUrl = URL.createObjectURL(blob);
    return avatarUrl;
}


function addObserverIfPossible() {
    const mutationObserver = new MutationObserver(async entries => {
                
        // Don't send notification if it's my message
        const bgColor = entries[0].addedNodes[0].firstChild.childNodes[1].firstChild.lastChild.attributes[1].nodeValue;
        if (bgColor === "background-color: #e7f1eb;") {
            return;
        }
        
        // Get name and image of the message sender
        const sender = entries[0].addedNodes[0].firstChild.firstChild.childNodes[1].innerText;
        const urlElement = entries[0].addedNodes[0].firstChild.firstChild.firstChild
            .firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.attributes[1].textContent;
        const avatarUrl = await getAvatar(urlElement);


        // only send notification if out of focus
        if (document.visibilityState === "hidden") {
            const messageText = entries[0].addedNodes[0].firstChild.lastChild.firstChild.lastChild.innerText;
            chrome.runtime.sendMessage(
                "", {
                    type: "notification",
                    options: {
                        title: sender + " says: ",
                        message: messageText,
                        iconUrl: avatarUrl,
                        type: "basic",
                    }
                }
            )
        }
    })

    const container = document.querySelector(".docs-chat-messages");
    // Node hasn't been created yet
    if(!container) {
        // wait until it's created
        window.setTimeout(addObserverIfPossible,500);
        return;
    }
    var config = {childList: true};
    mutationObserver.observe(container,config);
}
addObserverIfPossible();


