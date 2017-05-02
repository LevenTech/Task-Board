
function isMobile() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

function createBR() {
	return document.createElement("br");
}

// COLOR FUNCTIONS

function getContrastYIQ(hexcolor){
	var r = parseInt(hexcolor.substr(1,2),16);
	var g = parseInt(hexcolor.substr(3,2),16);
	var b = parseInt(hexcolor.substr(5,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? 'black' : 'white';
}

// COOKIE FUNCTIONS

function createCookie(name,value,days) {
	var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

// DATE FUNCTIONS

function getStartDate(myTaskID) {
	if (lines[myTaskID][col_startday] < 1) { return "" }
	var startYear=lines[myTaskID][col_startyear];
	if (startYear.length==2) startYear = "20"+startYear;
	if (startYear.length==0) startYear = today.getYear()+1900;
	var startDate = new Date(startYear,lines[myTaskID][col_startmonth]-1,lines[myTaskID][col_startday]);
	return startDate
}

function getDueDate(myTaskID) {
	if (lines[myTaskID][col_dueday] < 1) { return "" }
	var dueYear=lines[myTaskID][col_dueyear];
	if (dueYear.length==2) dueYear = "20"+dueYear;
	if (dueYear.length==0) dueYear = today.getYear()+1900;
	var dueDate = new Date(dueYear,lines[myTaskID][col_duemonth]-1,lines[myTaskID][col_dueday]);
	return dueDate
}

function makeDateStr(myDate) {
	var dateStr = myDate.toDateString()
	dateStr = dateStr.slice(0,-5)
	dateStr = eliminateLeadingZeros(dateStr)
	return dateStr
}

function makeTimeStrFromDate(myDate) {
	var hours = myDate.getHours();
	if (hours<1) var hoursStr = "12"
	else if (hours>12) var hoursStr = hours-12
	else var hoursStr = hours

	var minutesStr = myDate.getMinutes();
	if (minutesStr<10) minutesStr = "0"+minutesStr

	var timeStr = ""
	timeStr += (" "+(hoursStr) + ":" + minutesStr);
	if (hours>11) timeStr += " pm";
	else timeStr += " am";
	return timeStr
}

function getDateDifference(date_1,date_2) {
	return Math.ceil((date_2.getTime() - date_1.getTime())/one_day);
}