
function initPageLinks() {
	initPrivacyDialog()
	initAboutDialog()
	var pageLinks = getPageLinks()
	document.getElementById("title-bar").append(pageLinks)
}


function getPageLinks() {
	var pageLinks = document.createElement("div")
	pageLinks.id = "page-links"
	pageLinks.style = "position:absolute;top:0px;left:45vw;text-align:center;margin-top:5px;color:white;"
	pageLinks.innerHTML = "\
		<a href='javascript:void(0)' style='color:white;' onclick='showAboutDialog();'>About</a> -\
		<a href='https://www.gnu.org/licenses/gpl-3.0.en.html' style='color:white;' target='_blank' >License (GPLv3)</a> -\
		<a href='javascript:void(0)' style='color:white;' onclick='showPrivacyDialog();'>Privacy</a> -\
		<a href='http://www.leven.tech/suggestions/' style='color:white;' target='_blank' >Feedback</a>"
	return pageLinks;
}
		
		

function initAboutDialog() {
	var aboutDialog = document.createElement("div")
	aboutDialog.id="aboutDialog"
	aboutDialog.className = "my-dialog"
	aboutDialog.innerHTML += "Task Board is a sticky note application for your to-do list, with automatic sorting and highlighting to help you identify the most urgent tasks.<br/><br/>"
	aboutDialog.innerHTML += "<div style='float:left;width:60%;margin-bottom:10px;'>The board starts with one big region, but you can create as many as you want, and they will appear next to the main region.</div>"
	aboutDialog.innerHTML += "<div style='float:left;width:40%;margin-bottom:10px;padding-left:30px;'><div style='float:left;width:60px;'>\
				<div style='margin-bottom:2px;border:1px solid black;border-radius:3px;width:100%;height:20px;'></div>\
				<div style='margin-bottom:2px;border:1px solid black;border-radius:3px;width:100%;height:20px;'></div>\
				<div style='margin-bottom:2px;border:1px solid black;border-radius:3px;width:100%;height:20px;'></div></div>\
				<div style='margin-left:2px;border:1px solid black;border-radius:3px;float:left;width:60px;height:60px;'></div></div></div>"
	aboutDialog.innerHTML += "Tasks inside a region are sorted by their due date. Then the regions themselves are sorted by their next due task.<br/><br/>"
	aboutDialog.innerHTML += "<div style='float:left;width:60%;margin-bottom:10px;'>You can also create \"counter\" tasks that tally the days since it began. These tasks are shown as bars above the normal tasks.</div>"
	aboutDialog.innerHTML += "<div style='float:left;width:40%;margin-bottom:10px;padding-left:30px;'>\
					<div style='margin-left:2px;border:1px solid black;border-radius:3px;float:left;width:80px;height:60px;'>\
					<div style='background-color:black;float:left;border:1px solid black;width:68px;height:10px;margin:2px;'></div>\
					<div style='float:left;border:1px solid black;width:20px;height:20px;margin:2px;'></div>\
					<div style='float:left;border:1px solid black;width:20px;height:20px;margin:2px;'></div>\
					<div style='float:left;border:1px solid black;width:20px;height:20px;margin:2px;'></div>\
					</div></div>"
	document.getElementById("myBody").append(aboutDialog)
}


function showAboutDialog() {
	var opt = {
        autoOpen: false,
        modal: true,
        width: 600,
        height:400,
        title: 'About Task Board',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			OK: function() {
				$("#aboutDialog").dialog(opt).dialog("close");
			},
		}
    };
	$("#aboutDialog").dialog(opt).dialog("open");
}


function initPrivacyDialog() {
	var privacyDialog = document.createElement("div")
	privacyDialog.id="privacyDialog"
	privacyDialog.className = "my-dialog"
	privacyDialog.innerHTML = "This application is <a href='http://unhosted.org/' target='_blank' style='font-weight:bold;'>Unhosted</a>, meaning it doesn't store your data. While you use Task Board, all of your data remains in your control.<br/><br/>"
	privacyDialog.innerHTML += "By default, your data is only stored locally on the device you're using. We use cookies to remember your board, which are stored by your web browser. If you choose to download your data to a file, you can choose where it goes.<br/><br/>"
	privacyDialog.innerHTML += "If you choose to connect to <a href='https://remotestorage.io/' target='_blank' style='font-weight:bold;'>Remote Storage</a>, you will need to create a Remote Storage account through a provider like <a href='https://5apps.com/users/sign_up?site=deploy' target='_blank' style='font-weight:bold;'>5apps</a>. That way, your data remains yours."
	document.getElementById("myBody").append(privacyDialog)
}



function showPrivacyDialog() {
	var opt = {
        autoOpen: false,
        modal: true,
        width: 600,
        height:400,
        title: 'Privacy Policy',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			OK: function() {
				$("#privacyDialog").dialog(opt).dialog("close");
			},
		}
    };
	$("#privacyDialog").dialog(opt).dialog("open");
}