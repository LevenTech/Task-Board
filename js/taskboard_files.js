

// FILE HANDLING FUNCTIONS

function handleFiles(files) {

	if (parseInt(isSaved)==0) {
		showSaveDialog(files[0]);
	}
	else 
		// Check for the various File API support.
		if (window.FileReader) {
			// FileReader are supported.
			getAsText(files[0]);
		} else {
			alert('FileReader are not supported in this browser.');
		}
}

function getAsText(fileToRead) {
	var reader = new FileReader();
	// Handle errors load
	reader.onload = loadHandler;
	reader.onerror = errorHandler;
	// Read file into memory as UTF-8      
	reader.readAsText(fileToRead);
}

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);
	isSaved = 1;
	$("#unsaved-changes").hide();
	saveFileCookie();
}

function saveFileCookie() {
	var csvContent = "";
	lines.forEach(function(infoArray, index){
		if (infoArray[0]=="TaskNum" || infoArray[0]>0) {
			dataString = infoArray.join(",");
			csvContent += index < lines.length ? dataString+ "^" : dataString;
		}
	});

	if (remoteStorage.connected) {
		remoteStorage.tasks.store(csvContent);
		isSaved = 1;
	}

	createCookie("myCSVFile",csvContent);
	createCookie("isSaved",isSaved);

}

function loadRemoteStorage() {
	currentFileName = readCookie("fileName")
	remoteStorage.tasks.init();
}

function loadCookieFile() {
	var csv = readCookie("myCSVFile");
	if (csv) {
		var altcsv = csv.split("^");
		csv = altcsv.join("\n");
		processData(csv,readCookie("fileName"));
		isSaved = readCookie("isSaved");
		if (isSaved==1) $("#unsaved-changes").hide();
		else $("#unsaved-changes").show();
		currentFileName = readCookie("fileName")
		$(".fileinput-filename").html(currentFileName);
		$("span.fileinput-new").hide();
	}
}

function processData(csv,fileName) {
	var fullPath = document.getElementById('csvFileInput').value;
	if (!currentFileName) {
		var fileName = fullPath.split("\\");
		currentFileName = fileName[fileName.length-1];
		createCookie("fileName",currentFileName);
	}
	if (currentFileName) {
		if (currentFileName.indexOf("leventest")>-1) {
			var fileCreationDate = new Date(2017,4,1)
			var actualStartOfToday = new Date()
			actualStartOfToday.setHours(0,0,0,0);
			testFileDateDiff = getDateDifference(fileCreationDate,actualStartOfToday)
			isTestFile=1;
		}
	}
	
    var allTextLines = csv.split(/\r\n|\n/);
	lines = [];
    while (allTextLines.length) {
        lines.push(allTextLines.shift().split(','));
	}
	
	for (var j = 0; j < lines[0].length; j++) {
		if (lines[0][j]=="TaskNum") col_ID = j;
		if (lines[0][j]=="Task") col_task = j;
		if (lines[0][j]=="Row") col_row = j;
		if (lines[0][j]=="Due-Month") col_duemonth = j;
		if (lines[0][j]=="Due-Day") col_dueday = j;
		if (lines[0][j]=="Due-Year") col_dueyear = j;
		if (lines[0][j]=="Start-Month") col_startmonth = j;
		if (lines[0][j]=="Start-Day") col_startday = j;
		if (lines[0][j]=="Start-Year") col_startyear = j;
		if (lines[0][j]=="Color") col_color = j;
		if (lines[0][j]=="Complete?") col_complete = j;
		if (lines[0][j]=="Increment" || lines[0][j]=="Interval") col_increment = j;
	}
	
	if (isTestFile) makeTestDatesDisplayable();

	if (!remoteStorage.connected) $(".savefile-button").show()
	$("#chosen-file-label").show()
	$(".instructions").hide();
	$("#middle-buttons").show();
	$("#right-buttons").show();
	drawOutput(lines);
}


function saveFile() {

	if (isTestFile) makeTestDatesSavable();

	if (currentFileName.indexOf("_")>0) {
		var fileNameParts = currentFileName.split("_")
		var myMonth = today.getMonth()+1;
		if (myMonth.toString().length==1) myMonth = "0"+myMonth
		var myYear = today.getYear()+1900;
		currentFileName = fileNameParts[0] + "_" + myMonth + today.getDate() + myYear + ".csv";
	}
	createCookie("fileName",currentFileName)
	$(".fileinput-filename").html(currentFileName);
	
	var csvContent = "";
	lines.forEach(function(infoArray, index){
		if (infoArray[0]=="TaskNum" || infoArray[0]>0) {
			dataString = infoArray.join(",");
			csvContent += index < lines.length ? dataString+ "\n" : dataString;
		}
	}); 

	// FOR FIREFOX
	//var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	//var url = URL.createObjectURL(blob);

	var encodedUri = encodeURI(csvContent);
	var url = "data:text/csv,"+encodedUri;

	// FOR DROPBOX INTEGRATION
	/*url = "http://taskboard.leventech.net/sample.csv"
	var options = {
		files: [{'url': url, 'filename': currentFileName}],
		success: function () {
			alert("Success! Files saved to your Dropbox.");
		},
		progress: function (progress) {},
		cancel: function () {},
		error: function (errorMessage) {console.log("Error:"+errorMessage);}
	};
	Dropbox.save(options);
	return*/

	var link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", currentFileName);
	document.body.appendChild(link); // Required for FF
	link.click();
	
	isSaved = 1;
	$("#unsaved-changes").hide();
	createCookie("isSaved",1);
	
	if (isTestFile) makeTestDatesDisplayable();
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

function makeTestDatesDisplayable() {
	for (var i=0; i< lines.length; i++) {
		if (lines[i][col_startday]>0) { 
			var startDate = getStartDate(i)
			if (isTestFile) {
				startDate = new Date(startDate.getTime()+testFileDateDiff*one_day)
				lines[i][col_startday]=startDate.getDate()
				lines[i][col_startmonth]=startDate.getMonth()+1
				lines[i][col_startyear]=startDate.getYear()+1900
			}
		}
		if (lines[i][col_dueday]>0) {
			var dueDate = getDueDate(i)
			if (isTestFile) {
				dueDate = new Date(dueDate.getTime()+testFileDateDiff*one_day)
				lines[i][col_dueday]=dueDate.getDate()
				lines[i][col_duemonth]=dueDate.getMonth()+1
				lines[i][col_dueyear]=dueDate.getYear()+1900
			}
		}   
	}
}

function makeTestDatesSavable() {
	for (var i=0; i< lines.length; i++) {
		if (lines[i][col_startday]>0) { 
			var startDate = getStartDate(i)
			if (isTestFile) {
				startDate = new Date(startDate.getTime()-testFileDateDiff*one_day)
				lines[i][col_startday]=startDate.getDate()
				lines[i][col_startmonth]=startDate.getMonth()+1
				lines[i][col_startyear]=startDate.getYear()+1900
			}
		}
		if (lines[i][col_dueday]>0) {
			var dueDate = getDueDate(i)
			if (isTestFile) {
				dueDate = new Date(dueDate.getTime()-testFileDateDiff*one_day)
				lines[i][col_dueday]=dueDate.getDate()
				lines[i][col_duemonth]=dueDate.getMonth()+1
				lines[i][col_dueyear]=dueDate.getYear()+1900
			}
		}   
	}
}