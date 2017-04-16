
var developerKey = 'AIzaSyD9d4yzxvv-TeMlEToRVsFM9DEwHIJqopI';
var clientId = "31747680476-7featrglvba52v6thlmf9g6lhuvd1go5.apps.googleusercontent.com"
var appId = "31747680476";

var scope = ['https://www.googleapis.com/auth/drive.readonly'];

var pickerApiLoaded = false;
var oauthToken;

function onApiLoad() {
	//UNCOMMENT THE FOLLOWING LINES TO ENABLE THE GOOGLE DRIVE API
	//gapi.load('auth', {'callback': onAuthApiLoad});
	//gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
	window.gapi.auth.authorize(
		{
		  'client_id': clientId,
		  'scope': scope,
		  'immediate': false
		},
		handleAuthResult);
}

function onPickerApiLoad() {
	pickerApiLoaded = true;
	//createPicker();
}

function handleAuthResult(authResult) {
	if (authResult && !authResult.error) {
	  oauthToken = authResult.access_token;
	  //createPicker();
	}
}

// Create and render a Picker object for picking user Photos.
function createPicker() {
	if (pickerApiLoaded && oauthToken) {
		var picker = new google.picker.PickerBuilder().
			addView(google.picker.ViewId.DOCS).
			setOAuthToken(oauthToken).
			setAppId(appId).
			setDeveloperKey(developerKey).
			setCallback(pickerCallback).
			build();
		picker.setVisible(true);
	}
}

// A simple callback implementation.
function pickerCallback(data) {
	var url = 'nothing';
	if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
		var doc = data[google.picker.Response.DOCUMENTS][0];
		url = doc[google.picker.Document.URL];
		downloadFile(url);
	}
	var message = 'You picked: ' + url;
	document.getElementById('result').innerHTML = message;
}

function downloadFile(fileURL, callback) {
	if (fileURL) {
		var accessToken = gapi.auth.getToken().access_token;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', fileURL);
		xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		xhr.onload = function() {
		  alert(xhr.responseText);
		};
		xhr.onerror = function() {
		  alert("Error Loading File. Bummer.");
		};
		xhr.send();
	} else {
		alert("No URL to Load. Bummer.");
	}
}