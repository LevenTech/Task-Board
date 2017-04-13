

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
		alert("Canno't read file !");
	}
}

function drawOutput(lines){
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("table");
	var tableRows = [ document.createElement("td") , document.createElement("td") , document.createElement("td") , document.createElement("td") ];
	var widths = [ 200 , 200 , 200 , 200 ];
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
		if (lines[0][j]=="id") col_ID = j;
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
		taskBlock.style.width = 250;
		taskBlock.style.maxWidth = 250;
		taskBlock.style.height = 150;
		taskBlock.style.float = "left";
		taskBlock.style.textAlign = "center";
		taskBlock.style.padding = 10;
		taskBlock.style.margin = 10;
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

		if (startDay>0) {
			var startMonth=lines[i][col_startmonth]-1;
			var startYear=lines[i][col_startyear];
			var startDate = new Date(startYear,startMonth,startDay);
			var today = new Date();
			var one_day=1000*60*60*24;
			var date1_ms = today.getTime();
			var date2_ms = startDate.getTime();
			var difference_ms = date2_ms - date1_ms;
			var difference_days = Math.ceil(difference_ms/one_day);

			if (difference_days==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Starts TODAY"));
				taskBlock.appendChild(taskRow);
			}
			else if (startDate>today && dueDay >0) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDate.toDateString()));
				taskBlock.appendChild(document.createTextNode(" (wait "));
				taskBlock.appendChild(document.createTextNode(difference_days));
				taskBlock.appendChild(document.createTextNode(" days)"));
			}
			else if (startDate<today && dueDay<1) {
				taskBlock.appendChild(document.createTextNode("Start: "));
				taskBlock.appendChild(document.createTextNode(startDate.toDateString()));
				taskBlock.appendChild(document.createTextNode(" ("));
				taskBlock.appendChild(document.createTextNode(0-difference_days));
				taskBlock.appendChild(document.createTextNode(" passed)"));
			}
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
			var difference_days = Math.ceil(difference_ms/one_day);


			if (difference_days==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Due TODAY"));
				taskBlock.appendChild(taskRow);
			}
			else {
				taskBlock.appendChild(document.createTextNode("Due: "));
				taskBlock.appendChild(document.createTextNode(dueDate.toDateString()));
				if (startDay<1 || startDate<=today) {
					taskBlock.appendChild(document.createTextNode(" ("));
					taskBlock.appendChild(document.createTextNode(difference_days));
					taskBlock.appendChild(document.createTextNode(" left)"));
				}
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
			}
		}
		var row = lines[i][col_row];
		if (row<1) { row=0; }
		tableRows[row].append(taskBlock);
		widths[row]=widths[row]+300;
	}
	for (k = 1 ; k<tableRows.length ; k++) {
		var thisRow = document.createElement('tr');
		tableRows[k].style.border = "thick solid #000000";
		tableRows[k].style.minWidth = widths[row];
		thisRow.append(tableRows[k]);
		table.appendChild(thisRow);	
	}
	
	var outerTable = document.createElement("table");
	var oneRow = document.createElement("tr");
	var leftCell = document.createElement("td");
	leftCell.append(table)
	oneRow.append(leftCell);	
	tableRows[0].style.border = "thick solid #000000";
	oneRow.append(tableRows[0]);	
	outerTable.append(oneRow);
	document.getElementById("output").append(outerTable);
}
