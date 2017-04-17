
var lines = [];

var today = new Date();

var currentName = "newTaskFile.csv";
var isSaved = 1;
var currentTask = 0;
var lastTaskID = 0;

var	col_ID = 0;
var	col_task = 1;
var	col_row = 2;
var	col_duemonth = 3;
var	col_dueday = 4;
var	col_dueyear = 5;
var	col_startmonth = 6;
var	col_startday = 7;
var	col_startyear = 8;
var	col_color = 9;
var col_complete = 10;
var	col_increment = 11;

window.onbeforeunload = function() {
	if (!isSaved) { return "Did you save your stuff?" }
}

$(document).ready(function() {
	var opt = { autoOpen: false	};

	$("#editDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$(".my-dialog").show();
	
	$("#datepicker-start").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#editDialog").dialog("close");
			return false;
		}
	});
	$("#datepicker-due").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#editDialog").dialog("close");
			return false;
		}
	});
	$("#colorpicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#editDialog").dialog("close");
			return false;
		}
	});
	$("#namepicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#editDialog").dialog("close");
			return false;
		}
	});
	$("#incrementpicker").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#editDialog").dialog("close");
			return false;
		}
	});
	$("#newRowName").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			var rowName = $("#newRowName").val();
			lines[currentTask][col_row]=rowName;
			drawOutput(lines);
			$("#newRowDialog").dialog("close");
			currentTask = "";
			return false;
		}
	});
	$("#size-slider").slider();	
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

	if (isSaved!==1) {
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
	
	var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Complete Task',
		position: {my: "center center", at: "center center", of: "body"},
		buttons: { 
			Yes: function() {
				lines[currentTask][10]="Yes";
				if (lines[currentTask][11]>0) newTaskCopy();
				$("#completeDialog").dialog("close");
				isSaved = 0;
				drawOutput(lines);
			},
			No: function () {
				$("#completeDialog").dialog("close");
			}
		}
    };
	var taskName = lines[currentTask][1];
	$("#completeTaskName").text(taskName);
	$("#completeDialog").dialog(opt).dialog("open");
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
		var startYear=lines[currentTask][col_startyear];
		if (startYear.length==2) startYear = "20"+startYear;
		if (startYear.length==0) startYear = today.getYear()+1900;
		var startMonth=lines[currentTask][col_startmonth]-1;
		var startDate = new Date(startYear,startMonth,startDay);
		$("#datepicker-start").datepicker("setDate",startDate);
	}
	else $("#datepicker-start").datepicker("setDate","");

	var dueDay = lines[currentTask][col_dueday];
	if (dueDay>0) {
		var dueMonth=lines[i][col_duemonth]-1;
		var dueYear=lines[i][col_dueyear];
		if (dueYear.length==2) dueYear = "20"+dueYear;
		if (dueYear.length==0) dueYear = today.getYear()+1900;
		var dueDate = new Date(dueYear,dueMonth,dueDay);
		$("#datepicker-due").datepicker("setDate",dueDate);
	}
	else $("#datepicker-due").datepicker("setDate","");
	
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
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true,
        width: 360,
        height:360,
        title: 'Edit Task',
		position: {my: "center center", at: "center center", of: taskBlockID},
		buttons: { 
			Save: function() {
				updateTask(currentTask);
				$("#editDialog").dialog("close");
			},
			Cancel: function () {
				$("#colorpicker").val("");
				document.getElementById("colorpicker2").value = "#000000";
				$("#rowpicker").val("");
				$("#incrementpicker").val("");
				$("#namepicker").val("");
				$("#datepicker-due").datepicker("setDate","");
				$("#datepicker-start").datepicker("setDate","");
				currentTask = 0;
				$("#editDialog").dialog("close");
			}
		}		
	};
	$("#editDialog").dialog(opt).dialog("open");
}

function updateTask() {
	var newStringParts = lines[currentTask].slice();

	var newStartDate = $("#datepicker-start").datepicker("getDate");
	if (newStartDate==null) {
		newStringParts[col_startmonth] = "";
		newStringParts[col_startday] = "";
		newStringParts[col_startyear] = "";
	}
	else {
		newStringParts[col_startmonth] = newStartDate.getMonth()+1;
		newStringParts[col_startday] = newStartDate.getDate();
		newStringParts[col_startyear] = newStartDate.getYear()+1900;
		if (newStringParts[col_startyear]==today.getYear+1900) newStringParts[col_startyear]="";
	}

	var newDueDate = $("#datepicker-due").datepicker("getDate");
	if (newDueDate==null) {
		newStringParts[col_duemonth]="";
		newStringParts[col_dueday] = "";
		newStringParts[col_dueyear] = "";
	}
	else {
		newStringParts[col_duemonth] = newDueDate.getMonth()+1;
		newStringParts[col_dueday] = newDueDate.getDate();
		newStringParts[col_dueyear] = newDueDate.getYear()+1900;
		if (newStringParts[col_dueyear]==today.getYear+1900) newStringParts[col_dueyear]="";
	}

	newStringParts[col_color]=$("#colorpicker").val();
	newStringParts[col_increment]=$("#incrementpicker").val();
	newStringParts[col_task]=$("#namepicker").val();
	
	lines[currentTask] = newStringParts;
	drawOutput(lines);
	isSaved = 0;
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
	var dueMonth = lines[currentTask][col_duemonth]-1;
	var dueDate = new Date(dueYear,dueMonth,dueDay);			

	var startDay = lines[currentTask][col_startday];
	var startYear=lines[currentTask][col_startyear];
	if (startYear.length==2) startYear = "20"+startYear;
	if (startYear.length==0) startYear = today.getYear()+1900;
	var startMonth=lines[currentTask][col_startmonth]-1;
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
}

function newTask(rowName,taskName) {
	var newTask = [ "" , "" ,"","","","","","","","","",""];
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	if (!taskName) taskName = "New Task";
	newTask[col_task] = taskName;
	newTask[col_row] = rowName;
	lines.push(newTask);
	drawOutput(lines);
	isSaved = 0;
}

function saveFile() {
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
}

function processData(csv) {
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
	var fileName = fullPath.split("\\");
	currentFileName = fileName[fileName.length-1];
	isSaved = 1;
	$("#savefile-button").removeAttr('disabled');
	$("#finish-area").show();
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
	var taskID = ev.target.getAttribute("data-taskid");
	
	for(var i = 0; i < lines.length; i++) {
		if(parseInt(lines[i][0]) == taskID) {
			currentTask = i;
			break;
		}
	}

    ev.dataTransfer.setData("text", currentTask);
}

function drop(ev) {
    ev.preventDefault();
	ev.stopPropagation();
    var taskID = ev.dataTransfer.getData("text");
    var rowName = ev.target.getAttribute("data-rowname");
	lines[taskID][col_row]=rowName;
	isSaved = 0;
	drawOutput(lines);
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
    var taskID = ev.dataTransfer.getData("text");
	currentTask = taskID;
	$("#newRowName").val("");
	var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Move Task to New Row',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			OK: function() {
				var rowName = $("#newRowName").val();
				lines[taskID][col_row]=rowName;
				isSaved = 0;
				drawOutput(lines);
				$("#newRowDialog").dialog("close");
			},
			Cancel: function () {
				$("#newRowDialog").dialog("close");
			}
		}
    };
	$("#newRowDialog").dialog(opt).dialog("open");	
}

function newFile() {
	if (isSaved!==1) {
		showSaveDialog();
	}
	else {
		var line = [ "TaskNum" , "Task" ,"Start-Day","Start-Month","Start-Year","Due-Month","Due-Day","Due-Year","Color","Row","Complete?","Interval"];
		lines = [line];
		newTask("","New Misc Task");
		newTask("ROW","New Grouped Task");
		drawOutput(lines);
		currentFileName = "newTaskFile.csv";
		$(".fileinput-filename").html("newTaskFile.csv");
		$("span.fileinput-new").hide();
		$("#savefile-button").removeAttr('disabled');
		$("#finish-area").show();
		isSaved = 0;
	}
}

function drawOutput(lines){
	if (typeof lines[0] =="undefined") {return;}
	$(".savefile-button").show();
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("div");
	var rowWithMeta = [[],"MISC"]
	var tableRows = [rowWithMeta];
	var myMonth;
	var myDay;
	var myYear;


	
	var myFontSize = $( "#font-size" ).val();
	
	//alert(lines.length);
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
		taskBlock.setAttribute("data-taskid",lines[i][col_ID]);
		taskBlock.setAttribute("data-rowname",lines[i][col_row]);
		taskBlock.setAttribute("onclick","editTask(this)");
		var colorName = lines[i][col_color];
		if (colorName=="") colorName = "LemonChiffon";
		taskBlock.style.backgroundColor = colorName;

		var name = document.createElement("b");
		name.innerHTML = lines[i][col_task];
		name.setAttribute("ondrop","drop(event)");
		name.setAttribute("ondragover","allowDrop(event)");
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
			else if (startDate<today && dueDay<1) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDateStr));
				taskBlock.appendChild(document.createTextNode(" ("));
				taskBlock.appendChild(document.createTextNode(0-days_until_start));
				taskBlock.appendChild(document.createTextNode(" passed)"));
				taskBlock.className += " now-task";
			}
			else {
				taskBlock.className += " now-task";
			}
		}
		else {
			taskBlock.className += " now-task";
		}
		
		var BR = document.createElement("br");
		taskBlock.appendChild(BR);		
		
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
			}
			else if (days_until_due<0) {
				taskBlock.appendChild(document.createTextNode("Due: "));
				taskBlock.appendChild(document.createTextNode(dueDateStr));
				taskBlock.appendChild(document.createTextNode(" ("));
				taskBlock.appendChild(document.createTextNode(-days_until_due));
				taskBlock.appendChild(document.createTextNode(" passed)"));

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
				if (startDay<1 || startDate<=today) {
					taskBlock.appendChild(document.createTextNode(" ("));
					taskBlock.appendChild(document.createTextNode(days_until_due));
					taskBlock.appendChild(document.createTextNode(" left)"));
				}
			}
		}
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

		if (days_until_start.length==0) { days_until_start = 999; }  //Make blank sort after everything else
		if (days_until_due.length==0) { days_until_due = 999; }
		
		var taskBlockID = "taskBlock"+taskID;
		taskBlock.id = taskBlockID;
		
		var taskWithMeta = [ days_until_start, days_until_due , lines[i][col_task] , taskBlock ];
		tableRows[rowNum][0].push(taskWithMeta);
	}
	
	var maxLength = 0;

	for (row = 1 ; row<tableRows.length ; row++) {
		tableRows[row][0].sort(mySortFunction);
	}

	tableRows.sort(myRowSortFunction);
	
	for (row = 1 ; row<tableRows.length ; row++) {
		
		var tableRow = document.createElement("div");
		tableRow.className = "task-row";
		tableRow.setAttribute("ondrop","drop(event)");
		tableRow.setAttribute("ondragover","allowDrop(event)");
		
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
	if (myFontSize=="Small") table.style.flexBasis = 250*maxLength+50+"px";
	if (myFontSize=="Medium") table.style.flexBasis = 300*maxLength+50+"px";
	if (myFontSize=="Large") table.style.flexBasis = 350*maxLength+50+"px";
	
	tableRows[0][0].sort(mySortFunction);
	var miscTasks = document.createElement("div");
	for (n = 0 ; n<tableRows[0][0].length ; n++) {
		miscTasks.append(tableRows[0][0][n][3]);
	}	
	miscTasks.className = "misc-block";
	miscTasks.id = "misc-block";

	miscTasks.setAttribute("data-rowname","")
	miscTasks.setAttribute("ondrop","drop(event)");
	miscTasks.setAttribute("ondragover","allowDrop(event)");
	if (myFontSize=="Small") miscTasks.className += " misc-block-small"
	if (myFontSize=="Medium") miscTasks.className += " misc-block-medium"
	if (myFontSize=="Large") miscTasks.className += " misc-block-large"

	document.getElementById("output").append(table);
	document.getElementById("output").append(miscTasks);
	
	$(".task-row").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
	});
	$(".misc-block").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
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
	var compareString = a[0]+"/"+a[1]+"/"+a[2]+" vs "+b[0]+"/"+b[1]+"/"+b[2];
	if (a[1] == b[1])
	{
		if (a[0] == b[0]) 
		{
			var returnVal = (a[2] < b[2]) ? -1 : (a[2] > b[2]) ? 1 : 0
			if (debug) { alert(compareString + " = " + returnVal); }
			return returnVal;
		}
		else
		{
			var returnVal = (a[0] < b[0]) ? -1 : 1;
			if (debug) { alert(compareString + " = " + returnVal); }
			return returnVal;
		}
	}
	else
	{
		var returnVal = (a[1] < b[1]) ? -1 : 1;
		if (debug) { alert(compareString + " = " + returnVal); }
		return returnVal;
	}
}

  $( function() {
    $( "#font-size-slider" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 1,
      max: 3,
      value: 2,
      slide: function( event, ui ) {
		var sliderValue = ui.value.toString();
		if (sliderValue==1) { $( "#font-size" ).val( "Small" );}
		if (sliderValue==2) { $( "#font-size" ).val( "Medium" );}
		if (sliderValue==3) { $( "#font-size" ).val( "Large" );}
		drawOutput(lines);
      }
    });
    var sliderValue = $( "#font-size-slider" ).slider( "value" )
	if (sliderValue==1) { $( "#font-size" ).val( "Small" );}
	if (sliderValue==2) { $( "#font-size" ).val( "Medium" );}
	if (sliderValue==3) { $( "#font-size" ).val( "Large" );}
  } );
  
  $( function() {
    $( "#datepicker-start" ).datepicker();
    $( "#datepicker-due" ).datepicker();
  } );

  