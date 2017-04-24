
var lines = [];

var today = new Date();

var currentFileName = "newTaskFile.csv";
var isSaved = 1;
var currentTask = 0;
var lastTaskID = 0;

var	col_ID = 0;
var	col_task = 1;
var	col_startmonth = 2;
var	col_startday = 3;
var	col_startyear = 4;
var	col_duemonth = 5;
var	col_dueday = 6;
var	col_dueyear = 7;
var	col_color = 8;
var	col_row = 9;
var col_complete = 10;
var	col_increment = 11;

var dragcounter = 0;
var draggingNew = 0;
var makingNewTask

document.onselectstart = function() { return false; };

function closeEditDialogAndSave() {
	updateTask(currentTask);
	$("#editDialog").dialog("close");
	makingNewTask = 0;
	isSaved = 0;
	$("#unsaved-changes").show();
}

$(document).ready(function() {
	var opt = { autoOpen: false	};

	$("#editDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$("#deleteDialog").dialog(opt).dialog("close");
	$(".my-dialog").show();
	
	$("#datepicker-start").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			closeEditDialogAndSave();
			return false;
		}
	});
	$("#datepicker-due").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			closeEditDialogAndSave();
			return false;
		}
	});
	$("#colorpicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			closeEditDialogAndSave();
			return false;
		}
	});
	$("#namepicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			closeEditDialogAndSave();
			return false;
		}
	});
	$("#incrementpicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			closeEditDialogAndSave();
			return false;
		}
	});
	$("#newRowName").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			var rowName = $("#newRowName").val();
			if(draggingNew) {
				newTask(rowName)
			}
			else {
				lines[currentTask][col_row]=rowName;
			}
			drawOutput(lines);
			$("#newRowDialog").dialog("close");
			currentTask = "";
			return false;
		}
	});

	var cookieVal = readCookie('zoomCookie');
	if (cookieVal) {
		var sliderValue = cookieVal;
	}
	else { var sliderValue = 2; }
	if (sliderValue==1) { $( "#font-size" ).val( "Small" );}
	if (sliderValue==2) { $( "#font-size" ).val( "Medium" );}
	if (sliderValue==3) { $( "#font-size" ).val( "Large" );}

    $( "#font-size-slider" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 1,
      max: 3,
      value: sliderValue,
      slide: function( event, ui ) {
		var sliderValue = ui.value.toString();
		createCookie('zoomCookie',sliderValue);
		if (sliderValue==1) { $( "#font-size" ).val( "Small" );}
		if (sliderValue==2) { $( "#font-size" ).val( "Medium" );}
		if (sliderValue==3) { $( "#font-size" ).val( "Large" );}
		drawOutput(lines);
      }
    });
  
  $( function() {
    //$( "#datepicker-start" ).datepicker();
    //$( "#datepicker-due" ).datepicker();
  } );
  
	    $(function() {
        $.contextMenu({
            selector: '.task-block', 
			className: 'my-context-menu',
            callback: function(key, options) {
				if (key=="Finish") {
					completeTask();
				}
				if (key=="Delete") {
					deleteTask();
				}				
            },
            items: {
                "Finish": {name: "Finish", icon: "fa-check-square-o"},
                "Delete": {name: "Delete", icon: "fa-trash"},
            }
        });
    });	
	loadCookieFile();
	$.ui.dialog.prototype._focusTabbable = function(){};
});

function showSaveDialog(fileToOpen) {
		var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Save File?',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			Yes: function() {
				saveFile();
				$("#saveDialog").dialog(opt).dialog("close");
				if (fileToOpen) { getAsText(fileToOpen); }
				else { newFile(); }
			},
			No: function () {
				isSaved = 1;
				$("#saveDialog").dialog(opt).dialog("close");
				if (fileToOpen) { getAsText(fileToOpen); }
				else { newFile(); }
			},
			Cancel: function () {
				$("#saveDialog").dialog(opt).dialog("close");
			}			
		}
    };
	$("#saveDialog").dialog(opt).dialog("open");
}

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

function completeTask() {

	$("#deleteDialog").dialog("close");
	
	var opt = {
        autoOpen: false,
        modal: true,
        width: 350,
        height:350,
        title: 'Finish Task',
		position: {my: "center center", at: "center center", of: "body"},
		buttons: { 
			Yes: function() {
				lines[currentTask][10]="Yes";
				if (lines[currentTask][11].length>0) newTaskCopy();
				$("#completeDialog").dialog("close");
				$("#editDialog").dialog("close");
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
			},
			No: function () {
				$("#completeDialog").dialog("close");
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
			}
		}
    };
	var taskName = lines[currentTask][1];
	$("#completeTaskName").text(taskName);
	$("#completeDialog").dialog(opt).dialog("open");
}

function deleteTask() {

	$("#completeDialog").dialog("close");
	$("#finish-area").removeClass("hover-finish");
	$("#finish-area").addClass("normal-finish");
	$("#finish-instructions").hide();
	
	var opt = {
        autoOpen: false,
        modal: true,
        width: 350,
        height:350,
        title: 'Delete Task',
		position: {my: "center center", at: "center center", of: "body"},
		buttons: { 
			Yes: function() {
				lines.splice(currentTask,1);
				$("#deleteDialog").dialog("close");
				$("#editDialog").dialog("close");
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
			},
			No: function () {
				$("#deleteDialog").dialog("close");
			}
		}
    };
	var taskName = lines[currentTask][1];
	$("#deleteTaskName").text(taskName);
	$("#deleteDialog").dialog(opt).dialog("open");
}

function editTask(target) {
	var taskID = target.getAttribute("data-taskid");
	for(var i = 0; i < lines.length; i++) {
		if(parseInt(lines[i][0]) == taskID) {
			currentTask = i;
			break;
		}
	}

	var startDay = lines[currentTask][col_startday];
	if (startDay>0) {
		if (startDay.toString().length==1) startDay = "0" + startDay
		var startYear=lines[currentTask][col_startyear];
		if (startYear.length==2) startYear = "20"+startYear;
		if (startYear.length==0) startYear = today.getYear()+1900;
		var startMonth=lines[currentTask][col_startmonth];
		if (startMonth.toString().length==1) startMonth = "0" + startMonth
		var startDate = new Date(startYear,startMonth,startDay);
		var startDateStr = startYear + "-" + startMonth + "-" + startDay;
		$("#datepicker-start").val(startDateStr);
	}
	else $("#datepicker-start").val("");

	var dueDay = lines[currentTask][col_dueday];
	if (dueDay>0) {
		if (dueDay.toString().length==1) dueDay = "0" + dueDay
		var dueMonth=lines[i][col_duemonth];
		if (dueMonth.toString().length==1) dueMonth = "0" + dueMonth
		var dueYear=lines[i][col_dueyear];
		if (dueYear.length==2) dueYear = "20"+dueYear;
		if (dueYear.length==0) dueYear = today.getYear()+1900;
		var dueDate = new Date(dueYear,dueMonth,dueDay);
		var dueDateStr = dueYear + "-" + dueMonth + "-" + dueDay;
		$("#datepicker-due").val(dueDateStr);
	}
	else $("#datepicker-due").val("");
	
	var myColor = lines[currentTask][col_color];
	$("#colorpicker").val(myColor);
	if (myColor=="") { document.getElementById("colorpicker2").value = colourNameToHex("LemonChiffon") }
	if (myColor[0]=="#") { document.getElementById("colorpicker2").value = myColor }
	else { 
		var hexColor = colourNameToHex(myColor);
		if (hexColor[0]=="#") { document.getElementById("colorpicker2").value = hexColor }
	}
	$("#rowpicker").val(lines[currentTask][col_row]);
	$("#incrementpicker").val(lines[currentTask][col_increment]);
	$("#namepicker").val(lines[currentTask][col_task]);
	
	if (makingNewTask==1) var myTitle = "Create New Task"
	else var myTitle = "Edit Task"
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true,
        width: 370,
        height:370,
        title: myTitle,
		position: {my: "center center", at: "center center", of: taskBlockID},
		buttons: { 
			Save: function() {
				updateTask(currentTask);
				$("#editDialog").dialog("close");
				makingNewTask = 0;
				isSaved = 0;
				$("#unsaved-changes").show();
			},
			Cancel: function () {
				$("#colorpicker").val("");
				document.getElementById("colorpicker2").value = "#000000";
				$("#rowpicker").val("");
				$("#incrementpicker").val("");
				$("#namepicker").val("");
				$("#datepicker-due").val("");
				$("#datepicker-start").val("");
				if(makingNewTask==1) {
					lines.splice(currentTask,1);
				}
				makingNewTask = 0;
				currentTask = 0;
				$("#editDialog").dialog("close");
				drawOutput(lines);
			}
		}		
	};
	$("#editDialog").dialog(opt).dialog("open");
	$("#editDialog").find('button:nth-child(0)').focus();
}

function updateTask() {
	var newStringParts = lines[currentTask].slice();

	var newStartDate = $("#datepicker-start").val();
	var newStartDateParts = newStartDate.split("-")
	if (newStartDate==null) {
		newStringParts[col_startmonth] = "";
		newStringParts[col_startday] = "";
		newStringParts[col_startyear] = "";
	}
	else {
		newStringParts[col_startmonth] = newStartDateParts[1]
		newStringParts[col_startday] = newStartDateParts[2]
		newStringParts[col_startyear] = newStartDateParts[0]
		if (newStringParts[col_startyear]==today.getYear()+1900) newStringParts[col_startyear]="";
	}

	var newDueDate = $("#datepicker-due").val();
	var newDueDateParts = newDueDate.split("-")
	if (newDueDate==null) {
		newStringParts[col_duemonth]="";
		newStringParts[col_dueday] = "";
		newStringParts[col_dueyear] = "";
	}
	else {
		newStringParts[col_duemonth] = newDueDateParts[1]
		newStringParts[col_dueday] = newDueDateParts[2]
		newStringParts[col_dueyear] = newDueDateParts[0]
		if (newStringParts[col_dueyear]==today.getYear()+1900) newStringParts[col_dueyear]="";
	}

	newStringParts[col_color]=$("#colorpicker").val();
	newStringParts[col_increment]=$("#incrementpicker").val();
	newStringParts[col_task]=$("#namepicker").val();
	newStringParts[col_task] = newStringParts[col_task].replace(",","%44;");
	
	lines[currentTask] = newStringParts;
	drawOutput(lines);
	isSaved = 0;
	$("#unsaved-changes").show();
	saveFileCookie();
}

function colorpicked() {
	$("#colorpicker").val(document.getElementById("colorpicker2").value);
}

function colortyped() {
	var newColor = $("#colorpicker").val();
	if (newColor=="") newColor = "LemonChiffon";
	var hexColor = colourNameToHex(newColor);
	if (hexColor[0]=="#") document.getElementById("colorpicker2").value=hexColor;
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

function newTaskCopy() {
	var newTask = lines[currentTask].slice();
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	newTask[col_complete] = "";

	var one_day=1000*60*60*24;
	
	var dueDay = lines[currentTask][col_dueday];
	var dueYear=lines[currentTask][col_dueyear];
	if (dueYear.length==2) dueYear = "20"+dueYear;
	if (dueYear.length==0) dueYear = today.getYear()+1900;
	var dueMonth = lines[currentTask][col_duemonth];
	var dueDate = new Date(dueYear,dueMonth,dueDay);			

	var startDay = lines[currentTask][col_startday];
	var startYear=lines[currentTask][col_startyear];
	if (startYear.length==2) startYear = "20"+startYear;
	if (startYear.length==0) startYear = today.getYear()+1900;
	var startMonth=lines[currentTask][col_startmonth];
	var startDate = new Date(startYear,startMonth,startDay);
	var start_offset = dueDate.getTime() - startDate.getTime();
		
	if (startDay>0) {

		var new_startdate = new Date(today.getTime() + newTask[col_increment]*one_day);
		newTask[col_startmonth] = new_startdate.getMonth()+1;
		newTask[col_startday] = new_startdate.getDate();
		newTask[col_startyear] = new_startdate.getYear()+1900;
		
		if(dueDay>0) {
			var new_duedate = new Date(new_startdate.getTime() + start_offset);
			newTask[col_duemonth] = new_duedate.getMonth()+1;
			newTask[col_dueday] = new_duedate.getDate();
			newTask[col_dueyear] = new_duedate.getYear()+1900;
		}
	}
	else if (dueDay>0) {
		var new_duedate = new Date(today.getTime() + newTask[col_increment]*one_day);
		newTask[col_duemonth] = new_duedate.getMonth()+1;
		newTask[col_dueday] = new_duedate.getDate();
		newTask[col_dueyear] = new_duedate.getYear()+1900;

		if (startDay>0) {
			var new_startdate = new Date(new_duedate.getTime() - start_offset);
			newTask[col_startmonth] = new_startdate.getMonth()+1;
			newTask[col_startday] = new_startdate.getDate();
			newTask[col_startyear] = new_startdate.getYear()+1900;
		}
	}

	lines.push(newTask);
	drawOutput(lines);
	isSaved = 0;
	$("#unsaved-changes").show();
	saveFileCookie();
}

function newTask(rowName,taskName,openMe) {
	var newTask = [ "" , "" ,"","","","","","","","","",""];
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	//if (!taskName) taskName = "New Task";
	newTask[col_task] = taskName;
	newTask[col_row] = rowName;
	lines.push(newTask);
	drawOutput(lines);
	saveFileCookie();
	if (openMe==1) {
		makingNewTask = 1;
		$("#taskBlock"+lastTaskID).click();
		$("#namepicker").focus();
	}
}

function saveFile() {

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

	var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	var encodedUri = encodeURI(csvContent);
	var url = URL.createObjectURL(blob);
	var link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", currentFileName);
	document.body.appendChild(link); // Required for FF
	link.click();
	isSaved = 1;
	$("#unsaved-changes").hide();
	createCookie("isSaved",1);
}

function saveFileCookie() {
	var csvContent = "";
	lines.forEach(function(infoArray, index){
		if (infoArray[0]=="TaskNum" || infoArray[0]>0) {
			dataString = infoArray.join(",");
			csvContent += index < lines.length ? dataString+ "^" : dataString;
		}
	}); 
	createCookie("myCSVFile",csvContent,999);
	createCookie("isSaved",isSaved);
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
	drawOutput(lines);
	var fullPath = document.getElementById('csvFileInput').value;
	if (!fileName) {
		var fileName = fullPath.split("\\");
		currentFileName = fileName[fileName.length-1];
		createCookie("fileName",currentFileName);
	}
	$(".savefile-button").removeAttr('disabled');
	$("#middle-buttons").show();
	$("#right-buttons").show();
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

function highlightRow(ev) {
    ev.preventDefault();
	dragcounter++;
	if (ev.target.className.substr(0,8)=="task-row") {
		$(".task-row").removeClass("hover-row")
		$(".task-row").addClass("normal-row")
		$(".misc-block").removeClass("hover-row")
		$(".misc-block").addClass("normal-row")
		var toHighlight = 1;
		if (currentTask && draggingNew==0) {
			if (ev.target.getAttribute("data-rowname")==lines[currentTask][col_row].toUpperCase()) { toHighlight = 0; }
		}
		if (toHighlight) {
			ev.target.className = "task-row hover-row";
		}
	}
}
function unhighlightRow(ev) {
	dragcounter--;
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	if (dragcounter===0 || (isFirefox && dragcounter==1)) {
		if (ev.target.className.substr(0,8)=="task-row") {
			ev.target.className = "task-row normal-row";
		}
	}
}

function highlightMisc(ev) {
    ev.preventDefault();
	dragcounter++;
	var toHighlight = 1;
	if (currentTask && draggingNew==0) {
		if (lines[currentTask][col_row]=="") toHighlight=0;
	}
	if (toHighlight) {
		if (ev.target.className.substr(0,10)=="misc-block") {
		$(".task-row").removeClass("hover-row")
		$(".task-row").addClass("normal-row")
			ev.target.className = "misc-block hover-row";
			var myFontSize = $( "#font-size" ).val();
			if (myFontSize=="Small") ev.target.className += " misc-block-small"
			if (myFontSize=="Medium") ev.target.className += " misc-block-medium"
			if (myFontSize=="Large") ev.target.className += " misc-block-large"
		}
	}
	else {
		$(".task-row").removeClass("hover-row")
		$(".task-row").addClass("normal-row")
	}
}
function unhighlightMisc(ev) {
	dragcounter--;
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	if (dragcounter===0 || (isFirefox && dragcounter==1)) {
		if (ev.target.className.substr(0,10)=="misc-block") {
			ev.target.className = "misc-block normal-row";
			var myFontSize = $( "#font-size" ).val();
			if (myFontSize=="Small") ev.target.className += " misc-block-small"
			if (myFontSize=="Medium") ev.target.className += " misc-block-medium"
			if (myFontSize=="Large") ev.target.className += " misc-block-large"
		}
	}
}




function allowDrop(ev) {
    ev.preventDefault();
}

function highlightFinish(ev) {
	if (draggingNew==0) {
		ev.preventDefault();
		$("#finish-area").removeClass("normal-finish");
		$("#finish-area").addClass("hover-finish");
		$("#finish-instructions").show();
	}
}
function unhighlightFinish(ev) {
    ev.preventDefault();
	$("#finish-area").removeClass("hover-finish");
	$("#finish-area").addClass("normal-finish");
	$("#finish-instructions").hide();
}

function drag(ev) {
	draggingNew = 0;
	var taskID = ev.target.getAttribute("data-taskid");
	
	for(var i = 0; i < lines.length; i++) {
		if(parseInt(lines[i][0]) == taskID) {
			currentTask = i;
			break;
		}
	}

    ev.dataTransfer.setData("text", currentTask);
}

function dragNew(ev) {
	draggingNew = 1;
	ev.dataTransfer.setData("text", "newtask");
}

function drop(ev) {
	dragcounter = 0;
    ev.preventDefault();
	ev.stopPropagation();
    var rowName = ev.target.getAttribute("data-rowname");
	if(draggingNew==1) {
		newTask(rowName,"",1);
		saveFileCookie();
		drawOutput(lines);
	}
    else {
		var taskID = ev.dataTransfer.getData("text");
		if (lines[taskID][col_row]!==rowName) {
			lines[taskID][col_row]=rowName;
			isSaved = 0;
			$("#unsaved-changes").show();
			saveFileCookie();
			drawOutput(lines);
		}
	}
}

function dropFinish(ev) {
    ev.preventDefault();
    var taskID = ev.dataTransfer.getData("text");
	currentTask = taskID;
	completeTask();
	ev.stopPropagation();
}
	
function newRow(ev) {
    ev.preventDefault();
	if (draggingNew==1) return;
    var taskID = ev.dataTransfer.getData("text");
	currentTask = taskID;
	$("#newRowName").val("");
	var opt = {
        autoOpen: false,
        modal: true,
        width: 300,
        height:200,
        title: 'Move Task to New Group',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			OK: function() {
				var rowName = $("#newRowName").val();
				if(draggingNew) {
					newTask(rowName)
				}
				else {
					lines[taskID][col_row]=rowName;
				}
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
				$("#newRowDialog").dialog("close");
			},
			Cancel: function () {
				$("#newRowDialog").dialog("close");
			}
		}
    };
	$("#newRowDialog").dialog(opt).dialog("open");
	$("#newRowName").focus();
}

function newFile() {
	if (parseInt(isSaved)==0) {
		showSaveDialog();
	}
	else {
		var line = [ "TaskNum" , "Task" ,"Start-Day","Start-Month","Start-Year","Due-Month","Due-Day","Due-Year","Color","Row","Complete?","Interval"];
		lines = [line];
		newTask("","Misc Task");
		newTask("Group","Grouped Task");
		drawOutput(lines);
		var myMonth = today.getMonth()+1;
		if (myMonth.toString().length==1) myMonth = "0"+myMonth
		var myYear = today.getYear()+1900;
		currentFileName = "newTaskFile" + "_" + myMonth + today.getDate() + myYear + ".csv";
		$(".fileinput-filename").html(currentFileName);
		createCookie("fileName",currentFileName);
		$("span.fileinput-new").hide();
		$(".savefile-button").removeAttr('disabled');
		$("#middle-buttons").show();
		$("#right-buttons").show();
		isSaved = 2;
		$("#unsaved-changes").show();
		saveFileCookie();
	}
}

function drawOutput(lines){
	if (typeof lines[0] =="undefined") {return;}
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("div");
	var rowWithMeta = [[],"MISC"]
	var tableRows = [rowWithMeta];
	var myMonth;
	var myDay;
	var myYear;
	var clockIconVal;
	var noStartDay;
	var noDueDay;

	
	var myFontSize = $( "#font-size" ).val();
	
	for (var i = 1; i < lines.length; i++) {
		var taskID = parseInt(lines[i][col_ID]);
		//var taskID = i;
		//alert(lines[i][col_ID]);
		//alert(taskID);
		if (isNaN(taskID)) { continue; }
		if (lines[i][col_complete]=="Yes") { continue; }
		
		//alert(taskID);
		if (taskID>lastTaskID) { lastTaskID = taskID; }
		
		//Create and Style Task Block
		var taskBlock = document.createElement('div');
		taskBlock.className = "task-block"
		if (myFontSize=="Small") taskBlock.className += " small-block"
		if (myFontSize=="Medium") taskBlock.className += " medium-block"
		if (myFontSize=="Large") taskBlock.className += " large-block"
		taskBlock.setAttribute("draggable","true");
		taskBlock.setAttribute("ondragstart","drag(event)");
		//taskBlock.setAttribute("onmousedown","clickTaskBlock(event)");
		taskBlock.setAttribute("onmousedown","currentTask="+i);
		taskBlock.setAttribute("data-taskid",lines[i][col_ID]);
		taskBlock.setAttribute("data-rowname",lines[i][col_row]);
		taskBlock.setAttribute("onclick","editTask(this)");
		var colorName = lines[i][col_color];
		if (colorName=="") colorName = "LemonChiffon";
		taskBlock.style.backgroundColor = colorName;

		
		var myName = lines[i][col_task].replace("%44;",",");
		var name = document.createElement("b");
		name.innerHTML = myName;
		
		//name.setAttribute("ondrop","drop(event)");
		//name.setAttribute("ondragover","allowDrop(event)");
		name.setAttribute("data-rowname",lines[i][col_row]);
		taskBlock.appendChild(name);
		var BR = document.createElement("br");
		taskBlock.appendChild(BR);
		var BR = document.createElement("br");
		taskBlock.appendChild(BR);
		
		var startDay=lines[i][col_startday];
		var dueDay=lines[i][col_dueday];
		
		var days_until_start = "";
		var days_until_due = "";

		clockIconVal = 0;
		noStartDay = 0;
		
		if (startDay>0) {
			var startYear=lines[i][col_startyear];
			if (startYear.length==2) startYear = "20"+startYear;
			if (startYear.length==0) startYear = today.getYear()+1900;
			var startMonth=lines[i][col_startmonth]-1;
			var startDate = new Date(startYear,startMonth,startDay);
			var startDateStr = startDate.toDateString();
			startDateStr = startDateStr.substring(0,startDateStr.length-4);
			var one_day=1000*60*60*24;
			var date1_ms = today.getTime();
			var date2_ms = startDate.getTime();
			var difference_ms = date2_ms - date1_ms;
			var days_until_start = Math.ceil(difference_ms/one_day);
			
			if (days_until_start==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Starts TODAY"));
				taskBlock.appendChild(taskRow);
				taskBlock.className += " now-task";
			}
			else if (startDate>today) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDateStr));
				//new Date().toString('MM/dd HH:mm')
				taskBlock.appendChild(document.createTextNode(" (wait "));
				taskBlock.appendChild(document.createTextNode(days_until_start));
				taskBlock.appendChild(document.createTextNode(")"));
				taskBlock.className += " later-task";
			}
			else if (startDate<today && !dueDay>0) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDateStr));
				taskBlock.appendChild(document.createTextNode(" ("));
				taskBlock.appendChild(document.createTextNode(0-days_until_start));
				taskBlock.appendChild(document.createTextNode(" passed)"));
				taskBlock.className += " now-task";
				clockIconVal = (-days_until_start)*0.1;
				clockIconLabel = (-days_until_start);
				clockIconLabel = clockIconLabel.toString()+" +";
			}
			else {
				taskBlock.className += " now-task";
			}
		}
		else {
			noStartDay = 1;
			taskBlock.className += " now-task";
		}
		var BR = document.createElement("br");
		taskBlock.appendChild(BR);		

		noDueDay = 0;
		
		if (dueDay > 0) {
			var dueMonth=lines[i][col_duemonth]-1;
			var dueYear=lines[i][col_dueyear];
			if (dueYear.length==2) dueYear = "20"+dueYear;
			if (dueYear.length==0) dueYear = today.getYear()+1900;
			var dueDate = new Date(dueYear,dueMonth,dueDay);
			var dueDateStr = dueDate.toDateString();
			dueDateStr = dueDateStr.substring(0,dueDateStr.length-4);
			var one_day=1000*60*60*24;
			var date1_ms = today.getTime();
			var date2_ms = dueDate.getTime();
			var difference_ms = date2_ms - date1_ms;
			var days_until_due = Math.ceil(difference_ms/one_day);

			if (days_until_due==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Due TODAY"));
				taskBlock.appendChild(taskRow);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				
				var alertIcon = document.createElement("div");
				if (myFontSize=="Small") alertIcon.setAttribute("class","left-icon left-icon-small")
				if (myFontSize=="Medium") alertIcon.setAttribute("class","left-icon left-icon-medium")
				if (myFontSize=="Large") alertIcon.setAttribute("class","left-icon left-icon-large")
				alertIcon.setAttribute("style","margin-left:0.4em;")
				alertIcon.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);
				
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
			}
			else if (days_until_due<0) {
				taskBlock.appendChild(document.createTextNode("Due: "));
				taskBlock.appendChild(document.createTextNode(dueDateStr));
				taskBlock.appendChild(document.createTextNode(" ("));
				taskBlock.appendChild(document.createTextNode(-days_until_due));
				taskBlock.appendChild(document.createTextNode(" passed)"));

				var alertIcon = document.createElement("div");
				if (myFontSize=="Small") alertIcon.setAttribute("class","left-icon left-icon-small")
				if (myFontSize=="Medium") alertIcon.setAttribute("class","left-icon left-icon-medium")
				if (myFontSize=="Large") alertIcon.setAttribute("class","left-icon left-icon-large")
				alertIcon.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);

				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("!!! OVERDUE !!!"));
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				taskBlock.appendChild(taskRow);


			}
			else {
				taskBlock.appendChild(document.createTextNode("Due: "));
				taskBlock.appendChild(document.createTextNode(dueDateStr));
				if (!startDay>0 || startDate<=today) {
					taskBlock.appendChild(document.createTextNode(" ("));
					taskBlock.appendChild(document.createTextNode(days_until_due));
					taskBlock.appendChild(document.createTextNode(" left)"));
					clockIconVal = 1-(days_until_due*0.1);
					clockIconLabel = days_until_due.toString()+" -";
				}
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
			}
		}
		else { noDueDay = 1; }

		if (lines[i][col_increment].length>0) {
			var repeatIcon = document.createElement("div");
			if (myFontSize=="Small") repeatIcon.setAttribute("class","repeat-icon repeat-icon-small")
			if (myFontSize=="Medium") repeatIcon.setAttribute("class","repeat-icon repeat-icon-medium")
			if (myFontSize=="Large") repeatIcon.setAttribute("class","repeat-icon repeat-icon-large")
			repeatIcon.innerHTML = '<i class="fa fa-refresh" aria-hidden="true" ></i>';
			taskBlock.appendChild(repeatIcon);
			var repeatNum = document.createElement("div");
			if (myFontSize=="Small") repeatNum.setAttribute("class","repeat-num repeat-num-small")
			if (myFontSize=="Medium") repeatNum.setAttribute("class","repeat-num repeat-num-medium")
			if (myFontSize=="Large") repeatNum.setAttribute("class","repeat-num repeat-num-large")
			repeatNum.setAttribute("font-size","10px")
			if (lines[i][col_increment].length==1) repeatNum.setAttribute("style","margin-left:3px;")
			repeatNum.innerHTML = lines[i][col_increment];
			taskBlock.appendChild(repeatNum);
		};

		if (clockIconVal>0) {
			var myOpacity = clockIconVal;
			if (myOpacity>1) myOpacity = 1;
			var clockIcon = document.createElement("div");
			if (myFontSize=="Small") clockIcon.setAttribute("class","left-icon left-icon-small")
			if (myFontSize=="Medium") clockIcon.setAttribute("class","left-icon left-icon-medium")
			if (myFontSize=="Large") clockIcon.setAttribute("class","left-icon left-icon-large")
			clockIcon.setAttribute("style","opacity:"+myOpacity+";")
			clockIcon.innerHTML = '<i class="fa fa-clock-o" aria-hidden="true" ></i>';
			taskBlock.appendChild(clockIcon);
			var clockIconNum = document.createElement("div");
			if (myFontSize=="Small") clockIconNum.setAttribute("class","left-label left-label-small")
			if (myFontSize=="Medium") clockIconNum.setAttribute("class","left-label left-label-medium")
			if (myFontSize=="Large") clockIconNum.setAttribute("class","left-label left-label-large")
			clockIconNum.setAttribute("style","opacity:"+myOpacity+";")
			clockIconNum.innerHTML = clockIconLabel;
			taskBlock.appendChild(clockIconNum);
		};

		/*if (noStartDay==1 && noDueDay==1) {
			var questionIcon = document.createElement("div");
			if (myFontSize=="Small") questionIcon.setAttribute("class","left-icon left-icon-small")
			if (myFontSize=="Medium") questionIcon.setAttribute("class","left-icon left-icon-medium")
			if (myFontSize=="Large") questionIcon.setAttribute("class","left-icon left-icon-large")
			questionIcon.setAttribute("style","opacity:0.5;")
			questionIcon.innerHTML = '<i class="fa fa-question-circle-o" aria-hidden="true" ></i>';
			taskBlock.appendChild(questionIcon);
		}*/
		
		var rowName = lines[i][col_row];
		if (rowName == "") rowName = "MISC";
		else (rowName = rowName.toUpperCase());

		var rowExists = 0;
		for (var rowNum=0;rowNum<tableRows.length;rowNum++) {
			if (tableRows[rowNum][1]==rowName) {
				rowExists = 1;
				break;
			}
		}
		
		if (rowExists!==1) {
			var rowWithMeta = [[],rowName];
			tableRows.push(rowWithMeta);
		}

		//if (startDay>0 && !dueDay>0) { days_until_due = days_until_start; }

		var myTaskName = lines[i][col_task]
		if (myTaskName.length==0) { myTaskName = "ZZZZZ" }
		
		var taskBlockID = "taskBlock"+taskID;
		taskBlock.id = taskBlockID;
		
		var taskWithMeta = [ days_until_start, days_until_due , myTaskName , taskBlock ];
		tableRows[rowNum][0].push(taskWithMeta);
	}
	
	var maxLength = 0;

	for (row = 1 ; row<tableRows.length ; row++) {
		tableRows[row][0].sort(mySortFunction);
	}

	tableRows.sort(myRowSortFunction);
	
	for (row = 1 ; row<tableRows.length ; row++) {
		
		var tableRow = document.createElement("div");
		tableRow.className = "task-row normal-row";
		tableRow.setAttribute("id","task-row-"+tableRows[row][1]);
		tableRow.setAttribute("draggable","false");
		tableRow.setAttribute("ondrop","drop(event)");
		tableRow.setAttribute("ondragenter","highlightRow(event)");
		tableRow.setAttribute("ondragleave","unhighlightRow(event)");
		
		var thisRowName = document.createElement("div");
		var justTheName = document.createElement("div");
		justTheName.innerHTML = tableRows[row][1];
		justTheName.className = "vertical-text";

		thisRowName.append(justTheName);
		thisRowName.className = "row-name";
		if (myFontSize=="Small") thisRowName.className += " row-name-small"
		if (myFontSize=="Medium") thisRowName.className += " row-name-medium"
		if (myFontSize=="Large") thisRowName.className += " row-name-large"
		tableRow.append(thisRowName);
		tableRow.setAttribute("data-rowname",tableRows[row][1])
		for (n = 0 ; n<tableRows[row][0].length ; n++) {
			tableRow.append(tableRows[row][0][n][3]);
		}

		if (tableRows[row][0].length>maxLength) { maxLength=tableRows[row][0].length; }
	
		table.append(tableRow);
	}
		
	table.className = "left-side";
	table.setAttribute("draggable","false")
	if (myFontSize=="Small") table.style.flexBasis = 200*maxLength+50+"px";
	if (myFontSize=="Medium") table.style.flexBasis = 290*maxLength+50+"px";
	if (myFontSize=="Large") table.style.flexBasis = 340*maxLength+50+"px";
	
	tableRows[0][0].sort(mySortFunction);
	var miscTasks = document.createElement("div");
	for (n = 0 ; n<tableRows[0][0].length ; n++) {
		miscTasks.append(tableRows[0][0][n][3]);
	}	
	miscTasks.className = "misc-block normal-row";
	miscTasks.id = "misc-block";
	miscTasks.setAttribute("draggable","false")

	miscTasks.setAttribute("data-rowname","")
	miscTasks.setAttribute("ondrop","drop(event)");
	//miscTasks.setAttribute("ondragover","allowDrop(event)");
	miscTasks.setAttribute("ondragenter","highlightMisc(event)");
	miscTasks.setAttribute("ondragleave","unhighlightMisc(event)");
	
	if (myFontSize=="Small") miscTasks.className += " misc-block-small"
	if (myFontSize=="Medium") miscTasks.className += " misc-block-medium"
	if (myFontSize=="Large") miscTasks.className += " misc-block-large"

	document.getElementById("output").append(table);
	document.getElementById("output").append(miscTasks);
	
	$(".task-row").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName,"",1);
	});
	$(".misc-block").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName,"",1);
	});
	$(".task-row").on("taphold", function (){
		e.preventDefault();
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
		return false;
	});
	$(".misc-block").on("taphold", function (){
		e.preventDefault();
		alert("did it")
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
		return false;
	});
}


function myRowSortFunction(a,b) {	
	var compareString = a[1]+" vs "+b[1];
	if (a[1]=="MISC") return -1;
	if (b[1]=="MISC") return 1;
	return mySortFunction(a[0][0],b[0][0]);
}

function mySortFunction(a,b) {	
	var debug = 0;
	var returnVal;
	
	if (a[0]=="" && a[1].length==0) a[1]=999;
	if (b[0]=="" && b[1].length==0) b[1]=999;

	if (a[0]>0 && a[1].length==0) a[1]=a[0];
	if (b[0]>0 && b[1].length==0) b[1]=b[0];
	
	if (a[0]<0 && a[1].length==0) a[1]=-a[0]+0.1;
	if (b[0]<0 && b[1].length==0) b[1]=-b[0]+0.1;

	if (a[0].length==0) a[0]=-999;
	if (b[0].length==0) b[0]=-999;
	
	var compareString = a[0]+"/"+a[1]+"/"+a[2]+" vs "+b[0]+"/"+b[1]+"/"+b[2];

	if (a[1]==b[1])
	{
		if (a[0]==b[0]) 
		{
			returnVal = (a[2] < b[2]) ? -1 : (a[2] > b[2]) ? 1 : 0 
		}
		else
		{
			returnVal = (a[0] < b[0]) ? -1 : (a[0] > b[0]) ? 1 : 0 
		}
	}
	else
	{
		returnVal = (a[1] < b[1]) ? -1 : (a[1] > b[1]) ? 1 : 0 
	}
	if (debug) { alert(compareString + " = " + returnVal); }
	return returnVal;
}

  
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