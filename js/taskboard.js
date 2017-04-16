
var lines = [];
var lastTaskID = 0;
var currentTask = 0;
var isSaved = 1;
var currentName = "newTaskFile.csv";

window.onbeforeunload = function() {
	if (!isSaved) { return "Did you save your stuff?" }
}

$(document).ready(function() {
	var opt = { autoOpen: false	};
	$("#divDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$("#taskDetailsInput").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			updateTask();
			$("#divDialog").dialog("close");
			return false;
		}
	});
	$("#newRowName").keypress( function (e) {
		if(e.which == 13) {
			e.preventDefault();
			var rowName = $("#newRowName").val();
			lines[currentTask][9]=rowName;
			drawOutput(lines);
			$("#newRowDialog").dialog("close");
			currentTask = "";
			return false;
		}
	});
});


function updateTask() {
	var newString = lines[currentTask][0] + "\n" + $("#taskDetailsInput").val();
	var newStringParts = newString.split(/\r?\n/);
	for (var k = 0; k< newStringParts.length; k++) {
		if (newStringParts[k][0]=="[" && newStringParts[k][newStringParts[k].length-1]=="]") newStringParts[k]=""
	}
	lines[currentTask] = newStringParts;
	drawOutput(lines);
	isSaved = 0;
}

function showSaveDialog(fileToOpen) {
		var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Save File?',
		position: {my: "center center", at: "center center", of: "body"},
		buttons: { 
			Yes: function() {
				saveFile();
				$("#saveDialog").dialog("close");
				if (fileToOpen) { getAsText(fileToOpen); }
			},
			No: function () {
				$("#saveDialog").dialog("close");
				if (fileToOpen) { getAsText(fileToOpen); }
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
        title: 'Complete Task?',
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
				$("#divDialog").dialog("open");
			}
		}
    };
	var taskName = lines[currentTask][1];
	$("#completeTaskName").text(taskName);
	
	$("#divDialog").dialog("close");
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
	var toDisplay = lines[i].slice();
	if (toDisplay[2]=="") toDisplay[2]="[Start-Month]";
	if (toDisplay[3]=="") toDisplay[3]="[Start-Day]";
	if (toDisplay[4]=="") toDisplay[4]="[Start-Year]";
	if (toDisplay[5]=="") toDisplay[5]="[Due-Month]";
	if (toDisplay[6]=="") toDisplay[6]="[Due-Day]";
	if (toDisplay[7]=="") toDisplay[7]="[Due-Year]";
	if (toDisplay[8]=="") toDisplay[8]="[Color]";
	if (toDisplay[9]=="") toDisplay[9]="[Category]";
	if (toDisplay[10]=="") toDisplay[10]="[Complete?]";
	if (toDisplay[11]=="") toDisplay[11]="[Increment]";

	toDisplay.shift();
	var string = toDisplay.join("\r\n");

	$("#taskDetailsInput").val(string);
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true,
        width: 265,
        height:450,
        title: 'Edit Task',
		position: {my: "left top", at: "left top", of: taskBlockID},
		buttons: { 
			Complete: function() {
				completeTask(currentTask);
				$("#divDialog").dialog("close");
			},
			Save: function() {
				updateTask(currentTask);
				$("#divDialog").dialog("close");
			},
			Cancel: function () {
				$("#taskDetailsInput").val("");
				currentTask = 0;
				$("#divDialog").dialog("close");
			}
		}		
	};
	$("#divDialog").dialog(opt).dialog("open");
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
	for (var j = 0; j < lines[0].length; j++) {
		if (lines[0][j]=="TaskNum") var col_ID = j;
		if (lines[0][j]=="Task") var col_task = j;
		if (lines[0][j]=="Row") var col_row = j;
		if (lines[0][j]=="Due-Month") var col_duemonth = j;
		if (lines[0][j]=="Due-Day") var col_dueday = j;
		if (lines[0][j]=="Due-Year") var col_dueyear = j;
		if (lines[0][j]=="Start-Month") var col_startmonth = j;
		if (lines[0][j]=="Start-Day") var col_startday = j;
		if (lines[0][j]=="Start-Year") var col_startyear = j;
		if (lines[0][j]=="Color") var col_color = j;
		if (lines[0][j]=="Complete?") var col_complete = j;
		if (lines[0][j]=="Increment") var col_increment = j;
	}
	var newTask = lines[currentTask].slice();
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	newTask[col_complete] = "";

	var today = new Date();
	var one_day=1000*60*60*24;
	
	var dueYear=lines[currentTask][col_dueyear];
	if (dueYear.length==2) dueYear = "20"+dueYear;
	if (dueYear.length==0) dueYear = today.getYear()+1900;
	var dueMonth = lines[currentTask][col_duemonth]-1;
	var dueDay = lines[currentTask][col_dueday];
	var dueDate = new Date(dueYear,dueMonth,dueDay);			
	
	var startDay = lines[currentTask][col_startday];
	if (startDay>0) {
		var startYear=lines[currentTask][col_startyear];
		if (startYear.length==2) startYear = "20"+startYear;
		if (startYear.length==0) startYear = today.getYear()+1900;
		var startMonth=lines[currentTask][col_startmonth]-1;
		var startDate = new Date(startYear,startMonth,startDay);
		var start_offset = dueDate.getTime() - startDate.getTime();
	}
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
	
	lines.push(newTask);
	drawOutput(lines);
	isSaved = 0;
}

function newTask(rowName,taskName) {
	for (var j = 0; j < lines[0].length; j++) {
		if (lines[0][j]=="TaskNum") var col_ID = j;
		if (lines[0][j]=="Task") var col_task = j;
		if (lines[0][j]=="Row") var col_row = j;
		if (lines[0][j]=="Due-Month") var col_duemonth = j;
		if (lines[0][j]=="Due-Day") var col_dueday = j;
		if (lines[0][j]=="Due-Year") var col_dueyear = j;
		if (lines[0][j]=="Start-Month") var col_startmonth = j;
		if (lines[0][j]=="Start-Day") var col_startday = j;
		if (lines[0][j]=="Start-Year") var col_startyear = j;
		if (lines[0][j]=="Color") var col_color = j;
		if (lines[0][j]=="Complete?") var col_complete = j;
		if (lines[0][j]=="Increment") var col_increment = j;
	}
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
	//console.log(lines);
	drawOutput(lines);
	var fullPath = document.getElementById('csvFileInput').value;
	var fileName = fullPath.split("\\");
	currentFileName = fileName[fileName.length-1];
	isSaved = 1;
	$("#savefile-button").removeAttr('disabled');
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
	lines[taskID][9]=rowName;
	isSaved = 0;
	drawOutput(lines);
}

function dropBody(ev) {
    ev.preventDefault();
    var taskID = ev.dataTransfer.getData("text");
	currentTask = taskID;
	$("#newRowName").val("");
	var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Complete Task?',
		position: {my: "center center", at: "center center", of: "body"},
		buttons: { 
			OK: function() {
				var rowName = $("newRowName").val();
				lines[taskID][9]=rowName;
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
	var line = [ "TaskNum" , "Task" ,"Start-Day","Start-Month","Start-Year","Due-Month","Due-Day","Due-Year","Color","Row","Complete?","Increment"];
	lines = [line];
	newTask("MISC","New Misc Task");
	newTask("ROW","New Grouped Task");
	drawOutput(lines);
	currentFileName = "newTaskFile.csv";
	$(".fileinput-filename").html("newTaskFile.csv");
	$("span.fileinput-new").hide();
	$("#savefile-button").removeAttr('disabled');
	isSaved = 0;
}

function drawOutput(lines){
	$(".savefile-button").show();
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("div");
	var rowWithMeta = [[],"MISC"]
	var tableRows = [rowWithMeta];
	var myMonth;
	var myDay;
	var myYear;

	var today = new Date();

	for (var j = 0; j < lines[0].length; j++) {
		if (lines[0][j]=="TaskNum") var col_ID = j;
		if (lines[0][j]=="Task") var col_task = j;
		if (lines[0][j]=="Row") var col_row = j;
		if (lines[0][j]=="Due-Month") var col_duemonth = j;
		if (lines[0][j]=="Due-Day") var col_dueday = j;
		if (lines[0][j]=="Due-Year") var col_dueyear = j;
		if (lines[0][j]=="Start-Month") var col_startmonth = j;
		if (lines[0][j]=="Start-Day") var col_startday = j;
		if (lines[0][j]=="Start-Year") var col_startyear = j;
		if (lines[0][j]=="Color") var col_color = j;
		if (lines[0][j]=="Complete?") var col_complete = j;
		if (lines[0][j]=="Increment") var col_increment = j;
	}

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
		taskBlock.setAttribute("draggable","true");
		taskBlock.setAttribute("ondragstart","drag(event)");
		taskBlock.setAttribute("data-taskid",lines[i][col_ID]);
		taskBlock.setAttribute("data-rowname",lines[i][col_row])
		taskBlock.setAttribute("onclick","editTask(this)");
		var colorName = lines[i][col_color];
		if (colorName=="") colorName = "LemonChiffon";
		taskBlock.style.backgroundColor = colorName;

		var name = document.createElement("b");
		name.innerHTML = lines[i][col_task];
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

		if (days_until_due<0 || dueDay == 0) { days_until_due = 999; }
		
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
		tableRow.append(thisRowName);
		tableRow.setAttribute("data-rowname",tableRows[row][1])
		for (n = 0 ; n<tableRows[row][0].length ; n++) {
			tableRow.append(tableRows[row][0][n][3]);
		}

		if (tableRows[row][0].length>maxLength) { maxLength=tableRows[row][0].length; }
	
		table.append(tableRow);
	}
		
	table.className = "left-side";

	table.style.flexBasis = 300*maxLength+100+"px";
	
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

