hostname = "localhost"

// CLASSSES
class Message {
    data

    author

    room

    date

    constructor(tData, tAuthor, tRoom, tDate) {
        this.data = tData
        this.author = tAuthor
        this.room = tRoom
        this.date = tDate
    }
}

class User {
    id

    name

    constructor(tId, tName) {
        this.id = tId
        this.name = tName
    }
}

class Room {
    name

    messages

    id

    constructor(tId, tName) {
        if (tId.length != 8) {
            throw error
        }

        this.name = tName
        this.id = tId
        this.messages = []
    }
}

// displays one message
function dispMessages(message) {
    var te = document.getElementById("messages")

    var tempText = document.createElement("div")

    if (message.author.id == userID) {


        tempText.innerText = message.data
        tempText.style.textAlign = "right"

    }
    else {


        tempText.innerText += message.author.name + " : " + message.data
        tempText.style.textAlign = "left"

    }

    te.appendChild(tempText)

    te.innerHTML += "<br><br>"
}

// gets a random user id
const userID = Math.round(Math.random() * 8191)
const thisUser = new User(userID, "")
var tempCode = ""
document.getElementById("userName").value = userID

var currentRoom = null

// starts the socket
const socket = new WebSocket("ws://" + hostname + ":443")

// called when a message is received in the socket
socket.addEventListener("message", function (event) {

    UnCompressed = JSON.parse(event.data)

    // Get the content element
    var contentElement = document.querySelector('.content');

    // Scroll to the bottom
    contentElement.scrollTop = contentElement.scrollHeight;

    if (UnCompressed.room.id == currentRoom) {
        dispMessages(UnCompressed)
    }

})

//reads the value and sends the message of text input
function readMessage() {
    sendMessage(document.getElementById("input").value, currentRoom)
    document.getElementById("input").value = ""
}

// sends a message
function sendMessage(MessageSend, toRoom) {
    thisUser.name = document.getElementById("userName").value

    if (MessageSend != "") {
        socket.send(JSON.stringify(new Message(MessageSend, thisUser, new Room(toRoom, ""), 0)))
    }
}

//if username is empty
function isEmpty() {
    if (document.getElementById("userName").value == "") {
        document.getElementById("userName").value = userID
    }

}

// joins a room
function joinRoom() {
    const roomCode = document.getElementById("roomCode").value
    const url = "room/" + roomCode
    if (roomCode.length == 8) {
        const response = httpGet(url)

        // if the room does not exist
        if (response == "null") {
            tempCode = roomCode
            document.getElementById("top").innerHTML = "<form onsubmit='createRoom(); return false' id='roomForm'><input type='text' id='roomCode' placeholder='Room name' maxlength='16'> <input type='submit' id='rightButton' value='Create' ></form>"
        }

        // if the room exists
        else {
            console.log(response)
            try {
                var parsed = JSON.parse(response)

                addRoom(parsed.id, parsed.name)
                document.getElementById("roomCode").value = ""
            } catch {
                console.log("Failed to join room!")
            }
        }
    }



}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `${hostname}/${theUrl}`, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function addRoom(roomID, roomName) {
    var NewId = new String(roomID)
    while (NewId.length < 8) {
        NewId = "0" + NewId
    }

    var newButton = document.createElement("div")

    var tMid = document.getElementById("middle")

    console.log('<div> <input type="radio" class="switch" id="' + NewId + '" name="switch" ' + 'onclick="dispRoom(new String("' + NewId + '"))" > <label for="' + NewId + '">' + roomName + '</label> </divd>' + "<br><br><br>")


    var onClickHandler = 'dispRoom(new String("' + NewId + '"))';

    newButton.innerHTML = '<div> <input type="radio" class="switch" id="' + NewId + '" name="switch" onclick="dispRoom(new String(\'' + NewId + '\'))" > <label for="' + NewId + '">' + roomName + '</label> </div>' + "<br><br><br>";

    newButton.oncl

    tMid.appendChild(newButton)
}

function dispRoom(roomDisp) {
    currentRoom = roomDisp
    document.getElementById("input").disabled = false

    const url = "room/" + roomDisp
    const response = httpGet(url)

    const parsedResponse = JSON.parse(response)

    document.getElementById("DispName").innerText = parsedResponse.name

    parsedResponse.messages.forEach(element => {
        dispMessages(element)
    });

    var contentElement = document.querySelector('.content');

    // Scroll to the bottom
    contentElement.scrollTop = contentElement.scrollHeight;
}

function createRoom() {

    sendMessage(document.getElementById("roomCode").value, tempCode)

    addRoom(tempCode, document.getElementById("roomCode").value)

    tempCode = null
    document.getElementById("top").innerHTML = '  <form onsubmit="joinRoom(); return false" id="roomForm"><input type="text" id="roomCode" placeholder="Room code" maxlength="8">   <input type="submit" id="rightButton" value="Join"></form> '
}

/*
                <form onsubmit="joinRoom(); return false" id="roomForm">
                    <input type="text" id="roomCode" placeholder="Room code" maxlength="8"> 
                    <input type="submit" id="rightButton" value="Join">
                </form> */

/*
                <form onsubmit="createRoom(); return false" id="roomForm">
                    <input type="text" id="roomCode" placeholder="Room name" maxlength="16"> 
                    <input type="submit" id="rightButton" value="Join" >
                </form> */
