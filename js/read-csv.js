

function handleFiles(files) {
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
}

function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    while (allTextLines.length) {
        lines.push(allTextLines.shift().split(','));
    }
	console.log(lines);
	drawOutput(lines);
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

function drawOutput(lines){
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("div");
	var tableRows = [ [] , [] , [] , [] ];
	var rowNames = [ "MISC" ];
	var myMonth;
	var myDay;
	var myYear;
	var col_ID;
	var col_task;
	var col_duemonth;
	var col_dueday;
	var col_dueyear;
	var col_color;

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
	}

	for (var i = 1; i < lines.length; i++) {
		
		if (lines[i][col_ID]<1) { continue; }
		if (lines[i][col_complete]=="Yes") { continue; }
		
		//Create and Style Task Block
		var taskBlock = document.createElement('div');
		taskBlock.className = "task-block"
		taskBlock.style.backgroundColor = lines[i][col_color];

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
			var startMonth=lines[i][col_startmonth]-1;
			var startYear=lines[i][col_startyear];
			var startDate = new Date(startYear,startMonth,startDay);
			var today = new Date();
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
				taskBlock.appendChild(document.createTextNode(startDate.toDateString()));
				taskBlock.appendChild(document.createTextNode(" (wait "));
				taskBlock.appendChild(document.createTextNode(days_until_start));
				taskBlock.appendChild(document.createTextNode(")"));
				taskBlock.className += " later-task";
			}
			else if (startDate<today && dueDay<1) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDate.toDateString()));
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
			var dueDate = new Date(dueYear,dueMonth,dueDay);
			var one_day=1000*60*60*24;
			var today = new Date();
			var date1_ms = today.getTime();
			var date2_ms = dueDate.getTime();
			var difference_ms = date2_ms - date1_ms;
			var days_until_due = Math.ceil(difference_ms/one_day);



			if (days_until_due==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Due TODAY"));
				taskBlock.appendChild(taskRow);
			}
			if (days_until_due<0) {
				taskBlock.appendChild(document.createTextNode("Due: "));
				taskBlock.appendChild(document.createTextNode(dueDate.toDateString()));
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
				taskBlock.appendChild(document.createTextNode(dueDate.toDateString()));
				if (startDay<1 || startDate<=today) {
					taskBlock.appendChild(document.createTextNode(" ("));
					taskBlock.appendChild(document.createTextNode(days_until_due));
					taskBlock.appendChild(document.createTextNode(" left)"));
				}
			}
		}
		var row = lines[i][col_row].toUpperCase();
		if (row == "") row = "MISC";
		if (rowNames.indexOf(row)==-1) rowNames.push(row);
		row = rowNames.indexOf(row);
		if (days_until_due<0 || days_until_due == "") {days_until_due = 999;}
		var tableRowMeta = [ days_until_start, days_until_due , lines[i][col_task] , taskBlock ];
		tableRows[row].push(tableRowMeta);
	}
	
	var maxLength = 0;
	
	for (row = 1 ; row<tableRows.length ; row++) {
		
		tableRows[row].sort(mySortFunction);
		var tableRow = document.createElement("div");
		tableRow.className = "task-row";
		var thisRowName = document.createElement("div");
		thisRowName.innerHTML = rowNames[row];
		thisRowName.className = "vertical-text";
		tableRow.append(thisRowName);
		for (n = 0 ; n<tableRows[row].length ; n++) {
			tableRow.append(tableRows[row][n][3]);
		}

		if (tableRows[row].length>maxLength) { maxLength=tableRows[row].length; }
	
		table.append(tableRow);
	}
	
	table.className = "left-side";

	table.style.flexBasis = 300*maxLength+100+"px";
	
	tableRows[0].sort(mySortFunction);
	var miscTasks = document.createElement("div");
	for (n = 0 ; n<tableRows[0].length ; n++) {
		miscTasks.append(tableRows[0][n][3]);
	}	
	miscTasks.className = "misc-block";

	document.getElementById("output").append(table);
	document.getElementById("output").append(miscTasks);
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
