
function initTaskEditor() {
	generateEditDialog()
	initEditDialogKeys()
	initDateSyncing();
}

function generateEditDialog() {
	var myDialog = document.createElement("div")
	myDialog.id = "editDialog"
	myDialog.className = "my-dialog"
	myDialog.innerHTML += "\
		<div id='dialog-toolbar'>\
				<button id='edit-dialog-finish' type='button' class='btn btn-default dialog-toolbar-button' onclick='clickFinish();'>\
					<i class='fa fa-check-square-o' aria-hidden='true' style='margin-right:5px;'></i>Finish\
				</button>\
				<button type='button' class='btn btn-default dialog-toolbar-button' onclick='deleteTask();'>\
					<i class='fa fa-trash' aria-hidden='true' style='margin-right:5px;'></i>Delete\
				</button>\
		</div>";
	myDialog.innerHTML += "\
		<table style='float:left;width:100%;height:50%;'>\
			<tr style='height:0.5em;'></tr>\
			<tr style='vertical-align:top;'>\
				<td colspan='3'><textarea type='text' cols='21' rows='2' id='namepicker' style='width:100%;margin-bottom:5px;resize:none;text-align:center;'></textarea></td>\
			</tr>\
			<tr style='height:2em;'>\
				<td rowspan='2'>\
					Start:<br/>\
					<button id='sync-from-start' class='btn btn-default sync-button' onclick='syncDatesStart();'>\
						<i class='fa fa-arrow-down' aria-hidden='true'></i>\
					</button>\
					<button id='sync-from-due' class='btn btn-default sync-button' onclick='syncDatesDue();'>\
						<i class='fa fa-arrow-up' aria-hidden='true'></i>\
					</button>\
					<br/>\
					Due:\
				</td>\
				<td id='startpicker-row'><input type='date' id='datepicker-start' style='width:60%;'><input type='time' id='timepicker-start' style='width:40%;'></td>\
			</tr>\
			<tr><td id='duepicker-row'><input type='date' id='datepicker-due' style='width:60%;'><input type='time' id='timepicker-due' style='width:40%;'></td></tr>\
		</table>"
	myDialog.innerHTML += "\
		<table style='float:left;width:100%;text-align:center;'>\
			<tr style='height:0em;'></tr>\
			<tr style='height:2em;'>\
				<td colspan='2' style='width:60%;'>Color</td>\
				<td style='padding-right:0.3em;' style='width:40%;'>Interval</td>\
			</tr>\
			<tr style='vertical-align:top;'>\
				<td style='width:40%;'>\
					<div class='btn-group' role='group' style='float:right;'>" + 
						makeColorButton("LemonChiffon") + makeColorButton("Aqua") + makeColorButton("Pink") + makeColorButton("PaleGreen") + makeColorButton("Silver") + 
					"</div>\
					<div class='btn-group' role='group' style='float:right;'>" + 
						makeColorButton("Yellow") + makeColorButton("Orange") + makeColorButton("Red") + makeColorButton("Blue") + makeColorButton("Black") + 
					"</div>\
				</td>\
				<td>\
					<input style='float:left;width:3.4em;height:3.4em;' type='color' id='colorpicker2' onchange='colorpicked();' />\
				</td>\
				<td style='width:12em;'>\
					<div class='btn-group' role='group'>" + 
						  makeIntervalButton(0,"style='width:1.4em;'") + makeIntervalButton(1) + makeIntervalButton(2) + makeIntervalButton(3) + 
					"</div>\
					<div class='btn-group' role='group'>" + 
						  makeIntervalButton(7) + makeIntervalButton(14) + makeIntervalButton(30) + 
					"</div>\
				</td>\
			</tr>\
			<tr>\
				<td colspan='2'><input type='text' id='colorpicker' onchange='colortyped();' style='width:8em;margin-top:0.4em;text-align:center;' /></td>\
				<td><input type='text' id='incrementpicker' onchange='checkInterval()' style='margin-top:0.4em;width:4em;text-align:center;' /></td>\
			</tr>\
			</table>";
	document.getElementById("myBody").append(myDialog)
}

function initEditDialogKeys() {
	$("#datepicker-start").keypress( function (e) { return editDialogKeypress(e); });
	$("#datepicker-due").keypress( function (e) { return editDialogKeypress(e); });
	$("#timepicker-start").keypress( function (e) { return editDialogKeypress(e); });
	$("#timepicker-due").keypress( function (e) { return editDialogKeypress(e); });
	$("#colorpicker").keypress( function (e) { return editDialogKeypress(e); });
	$("#namepicker").keypress( function (e) { return editDialogKeypress(e); });
	$("#incrementpicker").keypress( function (e) { return editDialogKeypress(e); });
}

function editDialogKeypress(e) {
	if (e.which==13) {
		e.preventDefault();
		updateTask(currentTask);
		makingNewTask = 0;
		$("#editDialog").dialog("close");
		return false;
	}
}

function makeColorButton(color) {
	return "<button type='button' class='btn btn-default color-button' id='color-button-"+color+"' onclick='changeColor(\""+color+"\");'><div class='circle' style='background:"+color+";'></div></button>"
}

function makeIntervalButton(numDays,extraAttr) {
	var numDaysStr = numDays
	if (numDays==0) numDaysStr="-"
	return "<button type='button' class='btn btn-default interval-button' id='interval-button"+numDays+"' onclick='changeInterval("+numDays+")' "+extraAttr+">"+numDaysStr+"</button>"
}

function editTask(taskID,ev) {
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

	$("#timepicker-start").val(lines[currentTask][col_starttime]);

	var dueDay = lines[currentTask][col_dueday];
	if (dueDay>0) {
		if (dueDay.toString().length==1) dueDay = "0" + dueDay
		var dueMonth=lines[currentTask][col_duemonth];
		if (dueMonth.toString().length==1) dueMonth = "0" + dueMonth
		var dueYear=lines[currentTask][col_dueyear];
		if (dueYear.length==2) dueYear = "20"+dueYear;
		if (dueYear.length==0) dueYear = today.getYear()+1900;
		var dueDate = new Date(dueYear,dueMonth,dueDay);
		var dueDateStr = dueYear + "-" + dueMonth + "-" + dueDay;
		$("#datepicker-due").val(dueDateStr);
	}
	else $("#datepicker-due").val("");

	$("#timepicker-due").val(lines[currentTask][col_duetime]);
	
	currentTaskDateSync = 0;
	if (startDate && dueDate) {
		if (startDate.getTime()==dueDate.getTime() && lines[currentTask][col_starttime]==lines[currentTask][col_duetime]) {
			currentTaskDateSync = 1;
		}
	}

	if (currentTaskDateSync) {
		$(".sync-button").addClass("active")
		$("#startpicker-row").attr('rowspan', 2)
		$("#duepicker-row").hide()
	}
	else
	{
		currentTaskDateSync=0;
		$(".sync-button").removeClass("active")
		$("#startpicker-row").attr('rowspan', 1)
		$("#duepicker-row").show()
	}
		
	var myColor = lines[currentTask][col_color];
	$("#colorpicker").val(myColor);
	if (myColor=="") { document.getElementById("colorpicker2").value = colourNameToHex("LemonChiffon") }
	if (myColor[0]=="#") { document.getElementById("colorpicker2").value = myColor }
	else { 
		var hexColor = colourNameToHex(myColor);
		if (hexColor[0]=="#") { document.getElementById("colorpicker2").value = hexColor }
	}
	checkColor();

	$("#incrementpicker").val(lines[currentTask][col_increment]);
	checkInterval();

	$("#namepicker").val(lines[currentTask][col_task]);

	if (lines[currentTask][col_complete]=="Yes") {
		$("#edit-dialog-finish").addClass("active")
		if (editDebug) console.log("complete")
	}
	else $("#edit-dialog-finish").removeClass("active")
	
	if (makingNewTask==1) var myTitle = "New Task"
	else var myTitle = "Edit Task"
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true, resizable: false,
        height:380, width: 380,
        title: myTitle,
		buttons: { 
			Save: function() {
				updateTask(currentTask);
				makingNewTask = 0;
				$("#editDialog").dialog("close");
			},
			Cancel: function () {
				$("#editDialog").dialog("close");
			}
		},	
		open: function(event, ui) 
		{ 
			$('#dialog-toolbar').insertBefore('#editDialog');
			$('.ui-widget-overlay').bind('click', function()
			{ 
				$("#editDialog").dialog('close'); 
			}); 
		},
		close: function( event, ui ) {
			if(makingNewTask==1) {
				lines.splice(currentTask,1);
				lastTaskID--;
				makingNewTask = 0;
				drawOutput(lines);
			}
			currentTask = "";
			clearEditDialog();
		}
	};
	if (editDebug) console.log("editing taskBlockID="+taskBlockID)

	if (startDay>0 && !dueDay>0) $("#editDialog").dialog("option", { position: {my: "center center", at: "center center", of: myClickEvent, collision: "fit", within: "body"}});
	else $("#editDialog").dialog("option", { position: {my: "center center", at: "center center", of: taskBlockID, collision: "fit", within: "body"}} );

	$("#editDialog").dialog(opt);
	$("#editDialog").dialog("open");
	$("#editDialog").find('textarea').focus();
}


function clearEditDialog() {
	$("#colorpicker").val("");
	document.getElementById("colorpicker2").value = "#000000";
	$("#rowpicker").val("");
	$("#incrementpicker").val("");
	$(".interval-button").removeClass("active")
	$("#namepicker").val("");
	$("#datepicker-due").val("");
	$("#datepicker-start").val("");
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

	var newStartTime = $("#timepicker-start").val();
	newStringParts[col_starttime]=newStartTime;
	var newDueTime = $("#timepicker-due").val();
	newStringParts[col_duetime]=newDueTime;
	
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
	newStringParts[col_task] = newStringParts[col_task].replace("&","%38;");
	
	lines[currentTask] = newStringParts;
	drawOutput(lines);
	clearEditDialog();
	changeToUnsaved();
}

function syncDatesStart() {
	var meta_isSynced = 0;
	if (currentTaskDateSync) {
		currentTaskDateSync=0;
		$(".sync-button").removeClass("active")
		$("#startpicker-row").attr('rowspan', 1)
		$("#duepicker-row").show()
	}
	else {
		currentTaskDateSync = 1
		copyDateTimeFromStart();
		$(".sync-button").addClass("active")
		$("#startpicker-row").attr('rowspan', 2)
		$("#duepicker-row").hide()
  }
}

function syncDatesDue() {
	var meta_isSynced = 0;
	if (currentTaskDateSync) {
		currentTaskDateSync=0;
		$(".sync-button").removeClass("active")
		$("#startpicker-row").attr('rowspan', 1)
		$("#duepicker-row").show()
	}
	else {
		currentTaskDateSync= 1
		copyDateTimeFromDue();
		$(".sync-button").addClass("active")
		$("#startpicker-row").attr('rowspan', 2)
		$("#duepicker-row").hide()
	}
}

function initDateSyncing() {
	$("#datepicker-start").change(function() {
		if (currentTaskDateSync) $("#datepicker-due").val($("#datepicker-start").val());
		if (areDatesBad()) { copyDateTimeFromStart(); }
	});
	$("#datepicker-due").change(function() {
		if (currentTaskDateSync) $("#datepicker-start").val($("#datepicker-due").val());
		if (areDatesBad()) { copyDateTimeFromDue(); }
	});
	$("#timepicker-start").change(function() {
		if (currentTaskDateSync) $("#timepicker-due").val($("#timepicker-start").val());
		if (areDatesBad()) { copyDateTimeFromStart(); }
	});
	$("#timepicker-due").change(function() {
		if (currentTaskDateSync) $("#timepicker-start").val($("#timepicker-due").val());
		if (areDatesBad()) { copyDateTimeFromDue(); }
	});
}

function copyDateTimeFromStart() {
	$("#datepicker-due").val($("#datepicker-start").val())
	$("#timepicker-due").val($("#timepicker-start").val())
}

function copyDateTimeFromDue() {
	$("#datepicker-start").val($("#datepicker-due").val())
	$("#timepicker-start").val($("#timepicker-due").val())
}

function areDatesBad() {
	if ($("#datepicker-start").val()=="" || $("#datepicker-due").val()=="") return 0;

	var startDateVal = $("#datepicker-start").val();
	var startDateParts = startDateVal.split("-")
	var startDate = new Date(startDateParts[2],startDateParts[0],startDateParts[1]);

	var dueDateVal = $("#datepicker-start").val();
	var dueDateParts = dueDateVal.split("-")
	var dueDate = new Date(dueDateParts[2],dueDateParts[0],dueDateParts[1]);

	var startTime = $("#timepicker-start").val();
	var dueTime = $("#timepicker-due").val();

	if (dueDate.getTime()<startDate.getTime()) return 0
	if (dueDate.getTime()==startDate.getTime()) {
		if (startTime=="" || dueTime=="") return 0;
		if (dueTime<startTime) return 1
		else return 0
	}
	return 0
}

function colorpicked() {
	$("#colorpicker").val(document.getElementById("colorpicker2").value);
}

function colortyped() {
	checkColor();
	var newColor = $("#colorpicker").val();
	if (newColor=="") newColor = "LemonChiffon";
	var hexColor = colourNameToHex(newColor);
	if (hexColor[0]=="#") document.getElementById("colorpicker2").value=hexColor;
}

function changeColor(color) {
	$(".color-button").removeClass("active")
	$("#color-button-"+color).addClass("active")
	if (color=="LemonChiffon") $('#colorpicker').val("")
	else $('#colorpicker').val(color)
	colortyped();
}

function checkColor() {
	var color = $('#colorpicker').val()
	if (!color) color="LemonChiffon"
	$(".color-button").removeClass("active")
	$("#color-button-"+color).addClass("active")
}


function changeInterval(intVal) {
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
	if (intVal==0) $('#incrementpicker').val("")
	else $('#incrementpicker').val(intVal)
}

function checkInterval() {
	var intVal = $('#incrementpicker').val();
	if (!intVal) intVal=0;
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
}