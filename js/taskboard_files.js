

function initRemoteStorage() {
	/*remoteStorage.setApiKeys('googledrive', {
	  clientId: '31747680476-7featrglvba52v6thlmf9g6lhuvd1go5.apps.googleusercontent.com'
	});

	remoteStorage.setApiKeys('dropbox', {
	  appKey: 'tdk7d111530qw8d'
	});*/
	remoteStorage.setApiKeys('googledrive', "");
	remoteStorage.setApiKeys('dropbox', "");

	var shouldBeConnected = readCookie("isConnected")
	if (fileDebug) console.log(shouldBeConnected)
	if (shouldBeConnected==1) {
		$("#filename-selector").show();
		$(".fileinput-filename").hide();
		$("#filename-display").hide();
		$("#connected-to-remote").show();
		$("#not-connected-to-remote").hide();
		$("#savefile-button").hide();
		$("#unsaved-changes").hide();
		$(".remote-file-button").show()
		$("#openfile-button-name").hide()
		$("#importfile-button-name").show()
	}
	else {
		$("#not-connected-to-remote").show();
	}

	loadCookieFile();

	RemoteStorage.defineModule('tasks',	function(privateClient, publicClient) {
		var tasks = {}
		return { exports: tasks };
	});	
	
	RemoteStorage.defineModule('taskboards',	function(privateClient, publicClient) {
		var taskboards = {
			delete: function(taskboards) { 
				if (fileDebug) console.log("deleting file="+currentFileName)
				var fileToRemove = currentFileName
				privateClient.remove(currentFileName).then(function () {
					$("#option-"+fileToRemove).hide();
				});
				$("#filename-selector").val("");
			},
			store: function(taskboards) {
				if (fileDebug) console.log("storing file="+currentFileName)
				var csvContent = "";
				lines.forEach(function(infoArray, index){
					if (infoArray[0]=="TaskNum" || infoArray[0]>0) {
						dataString = infoArray.join(",");
						csvContent += index < lines.length ? dataString+ "\n" : dataString;
					}
				}); 
				return privateClient.storeFile("text/csv", currentFileName, csvContent);
			},
			init: function(taskboards) {
				if (fileDebug) console.log("rebuilding file list")
				privateClient.getListing("/", 1000).then(function (objects) {
					if (fileDebug) console.log(objects)
					var options
					var foundFile = 0;
					for (var key in objects) {
						if (key == currentFileName) {
							options += "<option id='option-"+key+"' value='"+key+"' selected>"+key+"</option>"
							remoteStorage.taskboards.load()
							foundFile = 1;
						}
						else options += "<option id='option-"+key+"' value='"+key+"'>"+key+"</option>"
					}
					if (foundFile==0) {
						options = "<option value='' selected></option>"+options
						noFileSelected();
					}
					else options = "<option value=''></option>"+options
					var fileNameSelector = document.getElementById("filename-selector")
					fileNameSelector.innerHTML = options
					return options
				});
				$(".instructions").hide();		
			},	
			load: function(taskboards) {
				$("#exportfile-button").attr("disabled",false)
				$("#renamefile-button").attr("disabled",false)
				$("#deletefile-button").attr("disabled",false)
				privateClient.getFile(currentFileName, 1000).then(function (file) {
					if (fileDebug) console.log("loading file="+currentFileName)
					if (file.data) processData(file.data,currentFileName)
					saveFileCookie();
					return file.data;
				});
			}		
		};
		return { exports: taskboards };
	});

	remoteStorage.access.claim('taskboards', 'rw');
	remoteStorage.access.claim('tasks', 'rw');
	remoteStorage.displayWidget();
	$("#remotestorage-widget").appendTo("#taskboard-remote-storage")
	

	remoteStorage.on("connected",function(privateClient, publicClient){
		isSaved = readCookie("isSaved")
		if (isSaved==0) {
			loadCookieFile()
			showBeforeConnectDialog();
		}
		else {
			createCookie("remoteConnected",1)
			$("#filename-selector").show();
			$("#filename-display").hide();
			$(".fileinput-filename").hide();
			$("#connected-to-remote").show();
			$("#not-connected-to-remote").hide();
			$("#savefile-button").hide();
			$("#unsaved-changes").hide();
			$(".remote-file-button").show()
			$("#openfile-button-name").hide()
			$("#importfile-button-name").show()
			loadRemoteStorage();
		}
		createCookie("isConnected",1)
	})

	remoteStorage.on("disconnected",function(privateClient, publicClient){
		createCookie("remoteConnected",0)
		eraseCookie("myCSVFile")
		lines = ""
		currentFileName = ""
		output.innerHTML = ""
		$(".instructions").show();		
		$(".other-buttons").hide();
		$("#filename-selector").hide();
		$("#filename-display").show();
		$("#connected-to-remote").hide();
		$("#not-connected-to-remote").show();
		$(".remote-file-button").hide()
		$("#openfile-button-name").show()
		$("#importfile-button-name").hide()
		isSaved = 1;
		createCookie("isSaved",1)
		createCookie("isConnected",0)
	})
	
	remoteStorage.on("error",function(errorMessage){
		alert("You were connected to remote storage, but your connection has been lost. Re-establish using the widget, otherwise your data will not sync to other devices.")
		//$("#chosen-file-label").hide()
		$("#filename-selector").hide();
		$(".fileinput-filename").show();
		$("#connected-to-remote").hide();
		$("#not-connected-to-remote").show();
		$(".remote-file-button").hide()
		$("#openfile-button-name").show()
		$("#importfile-button-name").hide()
		$("#savefile-button").show();
		createCookie("isConnected",0)
	})	
	
	$("#filename-selector").on("change",function() {
		currentFileName = $("#filename-selector").val();
		if (currentFileName.indexOf("leventest")!==-1) isTestFile = 1;
		else isTestFile = 0;
		if (currentFileName == "") {
			noFileSelected();
		}
		else {
			remoteStorage.taskboards.load();
		}
		createCookie("fileName",currentFileName)
	});	
	

}

function noFileSelected() {
	clearOutput();
	$("#exportfile-button").attr("disabled",true)
	$("#renamefile-button").attr("disabled",true)
	$("#deletefile-button").attr("disabled",true)
	$(".other-buttons").hide();
}


function clearOutput() {
	currentFileName = ""
	var output = document.getElementById("output")
	lines = []
	output.innerHTML = ""
	eraseCookie("fileName")
	eraseCookie("myCSVFile")
	if (fileDebug) console.log("clearing output")
}

function newFile() {
	if (parseInt(isSaved)==0) {
		showSaveDialog();
	}
	else {
		$("#newFileName").val("");
		var opt = {
			autoOpen: false,
			modal: true,
			width: 300,
			height:200,
			title: 'Create New File',
			position: {my: "center center", at: "center center", of: "body", collision: "fit", within: "body"},
			buttons: { 
				OK: function() {
					doNewFile();
				},
				Cancel: function () {
					$("#newFileDialog").dialog("close");
				}
			},
			close: function(event,ui) {
				$("#newfile-button").blur();
			}
		};
		$("#newFileDialog").dialog(opt).dialog("open");
		$("#newFileName").focus();
	}
}


function doNewFile() {
	currentFileName = $("#newFileName").val();
	if (currentFileName=="") currentFileName = "no name"
	var line = [ "TaskNum" , "Task" ,"Start-Month","Start-Day","Start-Year","Due-Month","Due-Day","Due-Year","Color","Row","Complete?","Interval","Start-Time","Due-Time"];
	lines = [line];
	drawOutput(lines);
	$(".fileinput-filename").html(currentFileName);
	createCookie("fileName",currentFileName);
	$("span.fileinput-new").hide();
	//$(".savefile-button").show();
	$(".file-button").attr("disabled",false);
	$(".instructions").hide();
	$(".other-buttons").show();
	isSaved = 2;
	saveFileCookie();
	$("#newFileDialog").dialog("close");
	if (remoteStorage.connected) { insertOption(); }
	else $("#unsaved-changes").show();	
}

function renameFile() {
	$("#renamedFileName").val(currentFileName);
	var opt = {
		autoOpen: false,
		modal: true,
		width: 300,
		height:200,
		title: 'Rename This File',
		position: {my: "center center", at: "center center", of: "body", collision: "fit", within: "body"},
		buttons: { 
			OK: function() {
				doRenameFile();
			},
			Cancel: function () {
				$("#renameFileDialog").dialog("close");
			}
		},
		close: function(event,ui) {
			$("#renamefile-button").blur();
		}
	};
	$("#renameFileDialog").dialog(opt).dialog("open");
	$("#renamedFileName").focus();	
}

function doRenameFile() {
	$("#renameFileDialog").dialog("close");
	
	remoteStorage.taskboards.delete()

	currentFileName = $("#renamedFileName").val();
	insertOption();
	saveFileCookie();
}

function insertOption() {
	var option = "<option id='option-"+currentFileName+"' value='"+currentFileName+"' selected>"+currentFileName+"</option>"
	var fileNameSelector = document.getElementById("filename-selector")
	fileNameSelector.innerHTML += option
	if (fileDebug) console.log("adding option="+option)
}

function deleteFile() {
	document.getElementById("deleteFileName").innerHTML = currentFileName
	var opt = {
		autoOpen: false,
		modal: true,
		width: 300,
		height:200,
		title: 'Delete This File',
		position: {my: "center center", at: "center center", of: "body", collision: "fit", within: "body"},
		buttons: { 
			Yes: function() {
				$("#deleteFileDialog").dialog("close");
				remoteStorage.taskboards.delete()
				noFileSelected();
			},
			No: function () {
				$("#deleteFileDialog").dialog("close");
			}
		},
		close: function(event,ui) {
			$("#filename-selector").blur();
		}
	};
	$("#deleteFileDialog").dialog(opt).dialog("open");
}

function initNewFileDialog() {
	var newFileDialog = document.createElement("div")
	newFileDialog.id="newFileDialog"
	newFileDialog.className = "my-dialog"
	newFileDialog.innerHTML = "<div style='text-align:center;'>Name the new file:<input id='newFileName' width='50px' style='margin-top:10px;'></input></div>"
	document.getElementById("myBody").append(newFileDialog)
}

function initRenameFileDialog() {
	var renameFileDialog = document.createElement("div")
	renameFileDialog.id="renameFileDialog"
	renameFileDialog.className = "my-dialog"
	renameFileDialog.innerHTML = "<div style='text-align:center;'>Choose a new name:<input id='renamedFileName' width='50px' style='margin-top:10px;'></input></div>"
	document.getElementById("myBody").append(renameFileDialog)
}

function initDeleteFileDialog() {
	var deleteFileDialog = document.createElement("div")
	deleteFileDialog.id="deleteFileDialog"
	deleteFileDialog.className = "my-dialog"
	deleteFileDialog.innerHTML = "<div style='text-align:center;'>Are you sure you want to delete the file \"<span id='deleteFileName'></span>\"?</div>"
	document.getElementById("myBody").append(deleteFileDialog)
}

function initFileDialogKeys() {
	$("#newFileName").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			doNewFile();
			return false;
		}
	});		

	$("#renamedFileName").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			doRenameFile();
			return false;
		}
	});	
}


// FILE HANDLING FUNCTIONS

function handleFiles(files) {

	if (parseInt(isSaved)==0) {
		showSaveDialog(files[0]);
	}
	else {
		// Check for the various File API support.
		if (window.FileReader) {
			// FileReader are supported.
			getAsText(files[0]);
		} else {
			alert('FileReader are not supported in this browser.');
		}
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
	
	var fullPath = document.getElementById('csvFileInput').value;
	var fileName = fullPath.split("\\");
	currentFileName = fileName[fileName.length-1];

	insertOption();
	
	isSaved = 1;
	$("#unsaved-changes").hide();
	saveFileCookie();
}

function saveFileCookie() {
	if (isTestFile) makeTestDatesSavable();

	var csvContent = "";
	lines.forEach(function(infoArray, index){
		if (infoArray[0]=="TaskNum" || infoArray[0]>0) {
			dataString = infoArray.join(",");
			csvContent += index < lines.length ? dataString+ "^" : dataString;
		}
	});

	if (remoteStorage.connected) {
		remoteStorage.taskboards.store(csvContent);
		isSaved = 1;
	}

	createCookie("fileName",currentFileName);
	createCookie("myCSVFile",csvContent);
	createCookie("isSaved",isSaved);

	if (isTestFile) makeTestDatesDisplayable();
}

function loadRemoteStorage() {
	currentFileName = readCookie("fileName")
	remoteStorage.taskboards.init();
}

function loadCookieFile() {
	var csv = readCookie("myCSVFile");
	if (csv) {
		var altcsv = csv.split("^");
		csv = altcsv.join("\n");
		currentFileName = readCookie("fileName")
		processData(csv,readCookie("fileName"));
		isSaved = readCookie("isSaved");
		if (isSaved==1) $("#unsaved-changes").hide();
		else $("#unsaved-changes").show();
		$(".fileinput-filename").html(currentFileName);
		$("span.fileinput-new").hide();
	}
	var fileName = readCookie("fileName");
	if (fileName) {
		var option = "<option id='option-"+currentFileName+"' value='"+currentFileName+"' selected>"+currentFileName+"</option>"
		var fileNameSelector = document.getElementById("filename-selector")
		fileNameSelector.innerHTML += option
	}
	else {
		noFileSelected();
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
		else isTestFile=0;
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
	//$("#chosen-file-label").show()
	$(".instructions").hide();
	$(".other-buttons").show();
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

	var downloadFileName = currentFileName
	if (downloadFileName.indexOf(".") == -1) downloadFileName += ".csv"
	
	var link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", downloadFileName);
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