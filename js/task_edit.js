function editDialogKeypress(e) {
	if (e.which==13) {
		e.preventDefault();
		updateTask(currentTask);
		makingNewTask = 0;
		$("#editDialog").dialog("close");
		return false;
	}
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
		console.log("complete")
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
				clearEditDialog();
				if(makingNewTask==1) {
					lines.splice(currentTask,1);
					lastTaskID--;
					makingNewTask = 0;
					drawOutput(lines);
				}
				currentTask = "";
			}
		},	
		open: function(event, ui) 
		{ 
            $('#dialog-toolbar').prependTo('.ui-dialog-titlebar');
			$('#dialog-toolbar').show();
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
			$('#dialog-toolbar').hide();
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
	
	lines[currentTask] = newStringParts;
	drawOutput(lines);
	clearEditDialog();
	isSaved = 0;
	$("#unsaved-changes").show();
	saveFileCookie();
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