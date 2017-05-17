
// MAIN BUILD FUNCTION

function drawOutput(lines){
	if (typeof lines[0] =="undefined") {return;}

	var rowWithMeta = [[],"MISC",[]]
	var tableRows = [rowWithMeta];
	
	$("#delete-finished-button").attr("disabled",true)
	var showBodyInstructions = 0;
	if (lines.length>1) showBodyInstructions = 1

	var numTasks = 0;
	for (var currentTask = 1; currentTask < lines.length; currentTask++) {
		
		if (editDebug) console.log(lines[currentTask])
		var taskNum = parseInt(lines[currentTask][col_ID]);

		if (isNaN(taskNum)) { continue; }
		numTasks++;
		
		if (taskNum>lastTaskID) { lastTaskID = taskNum; }

		var isComplete = 0;
		if (lines[currentTask][col_complete]=="Yes") isComplete = 1;
		if (showFinished==0 && isComplete==1) { continue; }
		
		var startDate="";
		var dueDate="";
		var days_until_start = ""
		var days_until_due = ""
		if (lines[currentTask][col_startday]>0) {
			startDate = getStartDate(currentTask)
			days_until_start = getDateDifference(today,startDate)
		}
		if (lines[currentTask][col_dueday]>0) {
			dueDate = getDueDate(currentTask)
			days_until_due = getDateDifference(today,dueDate)
		}

		var isPastTask = 0;
		if (startDate!=="") {
			if (startDate<today && dueDate=="" && isComplete==0) isPastTask = 1;
		}
		
		var taskBlock = buildTaskBlock(currentTask,startDate,dueDate,isComplete,isPastTask)

		var rowName = lines[currentTask][col_row];
		if (rowName == "" || rowName == null) rowName = "MISC";
		else (rowName = rowName.toUpperCase());

		var rowExists = 0;
		for (var rowNum=0;rowNum<tableRows.length;rowNum++) {
			if (tableRows[rowNum][1]==rowName) {
				rowExists = 1;
				break;
			}
		}
		
		if (rowExists!==1) {
			var rowWithMeta = [[],rowName,[]];
			tableRows.push(rowWithMeta);
		}

		var myTaskName = lines[currentTask][col_task]
		if (myTaskName.length==0) { myTaskName = "ZZZZZ" }

		var taskWithMeta = [ days_until_start, days_until_due , myTaskName , taskBlock , lines[currentTask][col_duetime]];
		if (isPastTask||isComplete) tableRows[rowNum][2].push(taskWithMeta);
		else tableRows[rowNum][0].push(taskWithMeta);
	}
	
	if (tableRows.length>1) showBodyInstructions = 0;
	
	document.getElementById("output").innerHTML = "";
	document.getElementById("output").append(createTable(tableRows));
	document.getElementById("output").append(createMiscBlock(tableRows));
	if (numTasks>0 && showBodyInstructions==1) {
		var bodyInstructions = document.createElement("div")
		bodyInstructions.setAttribute("id","body-instructions")
		bodyInstructions.setAttribute("style","font-size:2em;width:100%;text-align:center;margin-top:1em;")
		bodyInstructions.innerHTML = "Drag tasks out here to put them into a group"
		document.getElementById("output").appendChild(bodyInstructions);
	}
	document.getElementById("output").style =	"font-size:"+$( "#font-size" ).val()+"px;"

	if (numTasks<1) $("#misc-block").addClass("misc-with-help")

	if (shape=="wide") $(".task-details").hide();
	
	$(".task-row").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		if (editDebug) console.log("double-clicked row "+rowName)
		newTask(rowName,"",1);
	});
	$(".misc-block").dblclick( function (){
		if (editDebug) console.log("double-clicked misc block")
		newTask("","",1);
	});
}

// ELEMENT CREATION FUNCTIONS

function buildTaskBlock(currentTask,startDate,dueDate,isComplete,isPastTask) {

	var taskBlock = createTaskBlock(currentTask,lines[currentTask][col_color])

	var myName = lines[currentTask][col_task].replace("%44;",",");
	var myName = lines[currentTask][col_task].replace("%38;","&");
	var name = document.createElement("div");
	name.className = "task-name"
	name.innerHTML = "<b>"+myName+"</b>";
	taskBlock.appendChild(name)

	if (lines[currentTask][col_increment]>0) taskBlock.appendChild(createRepeatIcon(currentTask,(isPastTask||isComplete)))
	
	var days_until_start = "";
	var days_until_due = "";
	var startOfToday = new Date(today.getTime());
	startOfToday.setHours(0,0,0,0);
	var now_mseconds = today.getTime()-startOfToday.getTime();

	var startDatePhrase = document.createElement("span");
	startDatePhrase.className = "task-details start-date"
	if (startDate!=="") {
		var days_until_start = getDateDifference(today,startDate)
		var startDateStr = makeDateStr(startDate)
		startDatePhrase.innerHTML = startDateStr;
	}
	if (dueDate!=="") {
		var days_until_due = getDateDifference(today,dueDate)
		var dueDateStr = makeDateStr(dueDate)
		var dueDatePhrase = document.createElement("span")
		dueDatePhrase.className = "task-details due-date"
	}

	var sameTime=0;
	if (startDate!=="" && dueDate!=="") {
		if (startDate.getTime()==dueDate.getTime() && lines[currentTask][col_starttime]==lines[currentTask][col_duetime]) {
			sameTime = 1;
		}
	}

	if (isComplete==1) {
		$("#delete-finished-button").attr("disabled",false)
		taskBlock.className += " completed-task";
		if (startDate!=="" && dueDate!=="") {
			startDatePhrase.innerHTML = startDateStr + " - " + dueDateStr
			taskBlock.appendChild(startDatePhrase);
		}
		else if (startDate!=="") {
			startDatePhrase.innerHTML = "Start:"+startDateStr
			taskBlock.appendChild(startDatePhrase);
		}
		else if (dueDate!=="") {
			dueDatePhrase.innerHTML = "Due: "+dueDateStr
			taskBlock.appendChild(dueDatePhrase);
		}
		return taskBlock;
	}

	if (isPastTask==1) {
		taskBlock.className += " past-task";

		startDatePhrase.innerHTML = startDateStr;
		taskBlock.appendChild(startDatePhrase);

		var myOpacity = (-days_until_start)*0.1;
		if (myOpacity>1) myOpacity = 1;

		var iconSpan = document.createElement("span")
		iconSpan.className = "icon-span"
		if (lines[currentTask][col_increment]>0) iconSpan.className += " icon-margin"
		for(var k=0;k<(-days_until_start);k++) {
			var clockIcon = document.createElement("div");
			clockIcon.className = "clock-icon"
			clockIcon.innerHTML = '<i class="fa fa-clock-o" aria-hidden="true" ></i>';
			iconSpan.appendChild(clockIcon);
		}
		taskBlock.appendChild(iconSpan)		
		return taskBlock;
	}
	
	if (shape=="wide") taskBlock.className += " wide-task";
	else taskBlock.className += " default-task";

	taskBlock.appendChild(createBR());		
	if (startDate=="" || days_until_start<0) {
		startDatePhrase.innerHTML = "<b></b>";
		taskBlock.className += " now-task";
	}
	else if (days_until_start>0) {
		if (sameTime) startDatePhrase.innerHTML = ""
		else startDatePhrase.innerHTML = "Start: "+startDateStr+" (wait "+days_until_start+")"
		taskBlock.className += " later-task";
	}
	else if (days_until_start==0 && startDate!=="") {
		if (lines[currentTask][col_starttime]) {
			var timeParts = lines[currentTask][col_starttime].split(":")
			var start_mseconds = (timeParts[0]*60*60+timeParts[1]*60)*1000;
			var time_until_start = start_mseconds-now_mseconds;
			if (time_until_start>0) {
				if (sameTime) {
					startDatePhrase.innerHTML = "<b></b>";
					if (time_until_start < one_hour) taskBlock.className += " now-task"
					else taskBlock.className += " later-task"
				}
				else {
					taskBlock.className += " later-task";
					startDatePhrase.innerHTML = "<b>Starts Later TODAY</b>";
				}
			}
			else {
				if (sameTime) {
					startDatePhrase.innerHTML = "<b></b>";
					taskBlock.className += " now-task"
				}
				else {
					startDatePhrase.innerHTML = "<b>Started TODAY</b>";
					taskBlock.className += " now-task";
				}
			}
		}
		else {
			if (sameTime==0) startDatePhrase.innerHTML = "<b>Starts TODAY</b>";
			else startDatePhrase.innerHTML = "";
			taskBlock.className += " now-task";
		}							
	}
	taskBlock.appendChild(startDatePhrase);

	// WE'RE DONE IF THIS IS FOR A BAR INSTEAD OF A STICKY
	if (dueDate=="" || isPastTask==1) return taskBlock;

	taskBlock.appendChild(createBR());		

	var time_until_due=0;
	var dueTimeStr = ""
	if (lines[currentTask][col_duetime]) {
		var timeParts = lines[currentTask][col_duetime].split(":")
		if (timeParts[0]==0) dueTimeStr = "12:"+timeParts[1]
		else if (timeParts[0]>12) dueTimeStr = (timeParts[0]-12)+":"+timeParts[1]
		else dueTimeStr = eliminateLeadingZeros2(lines[currentTask][col_duetime])
		if (timeParts[0]>11 || lines[currentTask][col_duetime]=="12:00") dueTimeStr += " pm"
		else dueTimeStr += " am"
		var due_mseconds = (timeParts[0]*60*60+timeParts[1]*60)*1000;
		time_until_due = due_mseconds-now_mseconds;
	}
				
	if (days_until_due==0 && time_until_due==0) {
		dueDatePhrase.style.fontWeight = "bold"
		if (sameTime==0) dueDatePhrase.innerHTML = "<b>Due TODAY</b>";
		else dueDatePhrase.innerHTML = "<b>TODAY</b>";
		var isDueToday = 1;
		taskBlock.className += " due-task"
	}
	else if (days_until_due==0 && time_until_due>0) {
		dueDatePhrase.style.fontWeight = "bold"
		if (sameTime) dueDatePhrase.innerHTML = "<b>TODAY at "+dueTimeStr+"</b>";
		else dueDatePhrase.innerHTML = "<b>Due TODAY at "+dueTimeStr+"</b>";
		var isDueToday = 1;
	}
	else if (days_until_due==0 && time_until_due<0) {
		if (sameTime) dueDatePhrase.innerHTML = "<b>TODAY at "+dueTimeStr+"</b>";
		else dueDatePhrase.innerHTML = "<b>Due TODAY at "+dueTimeStr+"</b>";
		var isOverdue = 1;

	}
	else if (days_until_due<0) {
		dueDatePhrase.innerHTML = "Due: "+dueDateStr+" ("+(-days_until_due)+" passed)";
		var isOverdue = 1;
	}
	else {
		if (sameTime) dueDatePhrase.innerHTML = dueDateStr
		else dueDatePhrase.innerHTML = "Due: "+dueDateStr
		if (dueTimeStr!=="") dueDatePhrase.innerHTML += (", "+dueTimeStr)
		if (startDate=="" || startDate<=today) {
			dueDatePhrase.innerHTML += " ("+days_until_due+" left)"
			taskBlock.appendChild(createCountdownIcon(days_until_due));
		}
	}
	taskBlock.appendChild(dueDatePhrase)
	
	if (isDueToday==1) {
		var alertIcon = document.createElement("div");
		alertIcon.className = "alert-icon alert-indent";
		alertIcon.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true" ></i>';
		taskBlock.appendChild(alertIcon);
		taskBlock.className += " due-task"
	}

	if (isOverdue==1) {
		var alertIcon = document.createElement("div");
		alertIcon.className = "alert-icon";
		alertIcon.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true" ></i>';
		taskBlock.appendChild(alertIcon);

		var overDue = document.createElement("b");
		overDue.className = "task-details"
		overDue.innerHTML = "!!! OVERDUE !!!"
		taskBlock.appendChild(createBR());		
		taskBlock.appendChild(overDue);
		taskBlock.className += " due-task"
	}
	
	return taskBlock
}

function createTaskBlock(taskID,myColor) {
	var taskBlock = document.createElement('div');
	taskBlock.id = "taskBlock"+taskID;
	taskBlock.className = "task-block"
	taskBlock.setAttribute("draggable","true");
	taskBlock.setAttribute("ondragstart","drag(event)");
	taskBlock.setAttribute("onmousedown","currentTask="+taskID+";");
	taskBlock.setAttribute("data-taskid",taskID);
	taskBlock.setAttribute("onclick","clickTaskBlock(event,this)");

	var colorName = myColor;
	if (colorName=="" || colorName == null) colorName = "LemonChiffon";
	taskBlock.style.backgroundColor = colorName;
	
	if (colorName.substr(0,1)=="#") var myHexColor = colorName
	else var myHexColor = colourNameToHex(colorName)
	if (myHexColor) var myTextColor = getContrastYIQ(myHexColor)
	else myTextColor = "black"
	taskBlock.style.color = myTextColor	
	return taskBlock;
}

function createTable(tableRows) {
	var table = document.createElement("div");
	table.className = "left-side";
	table.id = "left-side";
	table.setAttribute("draggable","false")

	for (row = 0 ; row<tableRows.length ; row++) {
		tableRows[row][0].sort(mySortFunction);
		tableRows[row][2].sort(mySortFunction);
	}

	if (sortDebug) console.log("Sorting Rows")
	tableRows.sort(myRowSortFunction);
	
	for (row = 1 ; row<tableRows.length ; row++) {
		var tableRow = document.createElement("div");
		tableRow.setAttribute("id","task-row-"+tableRows[row][1]);
		tableRow.className = "task-row normal-row";
		tableRow.setAttribute("data-rowname",tableRows[row][1])
		tableRow.setAttribute("ondragenter","highlightRow(event)");
		tableRow.setAttribute("ondragleave","unhighlightRow(event)");
		tableRow.setAttribute("draggable","false");
		tableRow.setAttribute("ondrop","drop(event)");
		tableRow.append(createRowContents(tableRows[row],tableRows[row][1]));
		table.append(tableRow);
	}
	return table;
}
	
function createMiscBlock(tableRows) {	
	var miscTasks = document.createElement("div")
	miscTasks.id = "misc-block";
	miscTasks.className = "misc-block normal-row";
	miscTasks.setAttribute("data-rowname","")
	miscTasks.setAttribute("draggable","false")
	miscTasks.setAttribute("ondrop","drop(event)");
	miscTasks.setAttribute("ondragenter","highlightMisc(event)");
	miscTasks.setAttribute("ondragleave","unhighlightMisc(event)");
	var miscInstructions = document.createElement("div")
	miscInstructions.className = "misc-instructions"
	miscInstructions.innerHTML = "Double-click in this area to create a new task"
	miscInstructions.style = "position:absolute;left:20%;top:35%;font-size:2em;"
	miscTasks.append(miscInstructions);
	miscTasks.append(createRowContents(tableRows[0]));
	return miscTasks;
}

function createRowContents(myRowArray,myRowName) {

	var myContents = document.createElement("div");

	var myBar = document.createElement("div");
	myBar.setAttribute("class","table-bar")
	for (n = 0 ; n<myRowArray[2].length ; n++) {
		myBar.append(myRowArray[2][n][3]);
	}	
	myContents.append(myBar);

	if (myRowName) {
		var thisRowName = document.createElement("div");
		var justTheName = document.createElement("div");
		justTheName.innerHTML = myRowName;
		justTheName.className = "vertical-text";
		thisRowName.append(justTheName);
		thisRowName.className = "row-name";
		if (shape=="wide") thisRowName.className += " wide-row-name";
		else thisRowName.className += " default-row-name";
		myContents.append(thisRowName);
	}

	var myTasks = document.createElement("div");
	myTasks.setAttribute("class","table-contents")
	for (n = 0 ; n<myRowArray[0].length ; n++) {
		myTasks.append(myRowArray[0][n][3]);
	}		
	myContents.append(myTasks);

	return myContents;
}

function createRepeatIcon(taskID,isPastTask) {
	var repeatIcon = document.createElement("div")
	if (isPastTask==1) repeatIcon.className = "repeat-block repeat-block-past";
	else repeatIcon.className = "repeat-block repeat-block-normal";

	var justIcon = document.createElement("div");
	if (isPastTask==1) justIcon.className = "repeat-icon repeat-icon-past";
	else justIcon.className = "repeat-icon repeat-icon-normal";
	justIcon.innerHTML = '<i class="fa fa-refresh" aria-hidden="true" ></i>';
	repeatIcon.appendChild(justIcon);

	var repeatNum = document.createElement("div");
	if (isPastTask==1) repeatNum.className = "repeat-num repeat-num-past";
	else repeatNum.className = "repeat-num repeat-num-normal";
	repeatNum.innerHTML = lines[taskID][col_increment];
	repeatIcon.appendChild(repeatNum);

	return repeatIcon;
}

function createCountdownIcon(days_until_due) {
	var countdownIcon = document.createElement("div")
	countdownIcon.className = "countdown-block"
	
	clockIconLabel = days_until_due.toString();
	var myOpacity = 1-(days_until_due*0.1);
	if (myOpacity>1) myOpacity = 1;
	var justIcon = document.createElement("div");
	justIcon.className = "countdown-icon"
	justIcon.setAttribute("style","opacity:"+myOpacity+";")
	justIcon.innerHTML = '<i class="fa fa-calendar-o" aria-hidden="true" ></i>';
	countdownIcon.appendChild(justIcon);

	var clockIconNum = document.createElement("div");
	clockIconNum.className = "countdown-label"
	clockIconNum.setAttribute("style","opacity:"+myOpacity+";")
	clockIconNum.innerHTML = clockIconLabel;
	countdownIcon.appendChild(clockIconNum);	
	
	return countdownIcon;
}

// fngroup: SORTING FUNCTIONS

function myRowSortFunction(a,b) {	
	if (a[1]=="MISC") return -1;
	if (b[1]=="MISC") return 1;
	return mySortFunction(a[0][0],b[0][0]);
}

function mySortFunction(a,b) {	
	var returnVal;
	
	if (a[0]=="" && a[1].length==0) a[1]=999;
	if (b[0]=="" && b[1].length==0) b[1]=999;

	if (a[0]>0 && a[1].length==0) a[1]=a[0];
	if (b[0]>0 && b[1].length==0) b[1]=b[0];
	
	if (a[4]=="" || a[4]==null) a[4]="23:59";
	if (b[4]=="" || b[4]==null) b[4]="23:59";

	if (a[0].length==0) a[0]=-999;
	if (b[0].length==0) b[0]=-999;
	
	if (sortDebug) var compareString = a[0]+"/"+a[1]+"/"+a[2]+" vs "+b[0]+"/"+b[1]+"/"+b[2];

	if (a[1]==b[1])
	{
		if (a[0]==b[0]) 
		{
			if (a[4]==b[4]) {
				returnVal = (a[2] < b[2]) ? -1 : (a[2] > b[2]) ? 1 : 0 
			}
			else {
				returnVal = (a[4] < b[4]) ? -1 : (a[4] > b[4]) ? 1 : 0 
			}
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
	if (sortDebug) { console.log(compareString + " = " + returnVal); }
	return returnVal;
}
