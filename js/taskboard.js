
var myRightClickEvent;

var sortDebug = 0;
var editDebug = 0;

var lines = [];

var shape = "";
var inRightClickMode = 0;
var dateSliderActive = 0;

var maxLength = 0;

var today = new Date();
var one_day=1000*60*60*24;

var currentFileName = "newTaskFile.csv";
var isSaved = 1;
var currentTask = 0;
var currentRowName = "";
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
$(document).ready(function() {

	var opt = { autoOpen: false	};
	$("#editDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$("#deleteDialog").dialog(opt).dialog("close");
	$(".my-dialog").show();
	
	$("#datepicker-start").keypress( function (e) { return editDialogKeypress(e); });
	$("#datepicker-due").keypress( function (e) { return editDialogKeypress(e); });
	$("#colorpicker").keypress( function (e) { return editDialogKeypress(e); });
	$("#namepicker").keypress( function (e) { return editDialogKeypress(e); });
	$("#incrementpicker").keypress( function (e) { return editDialogKeypress(e); });
	
	$("#newRowName").keypress( function (e) {
		if(e.which == 13) {
			$("#newRowDialog").dialog("close");
			e.preventDefault();
			var rowName = $("#newRowName").val();
			if (draggingNew) {	newTask(rowName)	}
			else {				lines[currentTask][col_row]=rowName;	}
			drawOutput(lines);
			currentTask = "";
			return false;
		}
	});

	var shapeCookie = readCookie('shapeCookie');
	if (shapeCookie=="wide") {
		$("#shape-button-wide").addClass("active")
		makeShapeWide()
	}
	else {
		$("#shape-button-default").addClass("active")
	}

	var todaysDateStr = today.toDateString()
	todaysDateStr = todaysDateStr.slice(0,-4)
	$("#todays-date").val(todaysDateStr);

	initSliders()
	initContextMenu("right")
	
	loadCookieFile();

	$.ui.dialog.prototype._focusTabbable = function(){};
	
	$(document).on('mousedown', '.task-block', function (e){ 
		myClickEvent = e
		return true; 
	}); 

	if (isMobile()) {
		var miscBlock = document.getElementById('myBody');
		var fingers = new Fingers(miscBlock);
		new Fingers(miscBlock)
		.addGesture(Fingers.gesture.Tap, { nbFingers: 2} )
		.addHandler(function(eventType, data, fingerList) {
			if (inRightClickMode == 0) {
				inRightClickMode = 1
				$("#right-click-mode-indicator").show();
				initContextMenu("left")
			}
			else {
				inRightClickMode = 0
				$("#right-click-mode-indicator").hide();
				initContextMenu("right")
			}
		})
	}
	
});  // END OF DOC.READY
	
	

// INIT FUNCTIONS

function initSliders() {
	var cookieVal = readCookie('zoomCookie');
	if (cookieVal) {	var sliderValue = cookieVal;	}
	else { 				var sliderValue = 14; 			}
	$( "#font-size" ).val(sliderValue);
	
	var myFontSizeSlider = document.getElementById('font-size-slider');
	noUiSlider.create(myFontSizeSlider, {
		start: [sliderValue],
		step: 1,
		connect: true,
		range: {
			'min': 8,
			'max': 24
		}
	});

	myFontSizeSlider.noUiSlider.on('slide', function(){
		var sliderValue = Math.floor(document.getElementById('font-size-slider').noUiSlider.get());
		createCookie('zoomCookie',sliderValue);
		$( "#font-size" ).val(sliderValue);
		drawOutput(lines);
	})
	
	var myTodaysDateSlider = document.getElementById('todays-date-slider');
	noUiSlider.create(myTodaysDateSlider, {
		start: [0],
		step: 1,
		behavior: "tap-drag",
		connect: true,
		range: {
			'min': 0,
			'max': 7
		},
	});

	myTodaysDateSlider.noUiSlider.on('start', function(){	dateSliderActive = 1; })
	myTodaysDateSlider.noUiSlider.on('slide', function(){
		var sliderValue = Math.floor(document.getElementById('todays-date-slider').noUiSlider.get())
		makeDateIncremented(sliderValue);
		drawOutput(lines);
	})
	myTodaysDateSlider.noUiSlider.on('end', function(){	dateSliderActive = 0; })

	myTodaysDateSlider.noUiSlider.on('set', function(){
		var sliderValue = Math.floor(document.getElementById('todays-date-slider').noUiSlider.get())
		makeDateIncremented(sliderValue);
		drawOutput(lines);
	})

	myTodaysDateSlider.noUiSlider.on('change', function(){
		var sliderValue = Math.floor(document.getElementById('todays-date-slider').noUiSlider.get())
		makeDateIncremented(sliderValue);
		drawOutput(lines);
		if (dateSliderActive==0) setTimeout(clearDateSlider,300);
		else {
			dateSliderActive=0;
			clearDateSlider();
		}
	})
	
}

function clearDateSlider() {
	document.getElementById('todays-date-slider').noUiSlider.reset();
}

function initContextMenu(button) {
	$.contextMenu( 'destroy' );
	var myOptions = {
            selector: '.task-block', 
			className: 'my-context-menu',
			events: {
				hide: function(opt) {
					inRightClickMode = 0;
					$("#right-click-mode-indicator").hide();
					initContextMenu("right")
				}
			  },
			  items: {
                "Delay": {
					name: "Delay", icon: "fa-bell-slash-o",
					callback: function(key, options) {
						delayTask(currentTask);
					},
			        visible: function(key, opt){        
						var myTaskID = currentTask;
						var isDue = 0;
						var dueDay = lines[myTaskID][col_dueday];
						if (dueDay > 0) {
							var dueMonth=lines[myTaskID][col_duemonth]-1;
							var dueYear=lines[myTaskID][col_dueyear];
							if (dueYear.length==2) dueYear = "20"+dueYear;
							if (dueYear.length==0) dueYear = today.getYear()+1900;
							var dueDate = new Date(dueYear,dueMonth,dueDay);
							var date1_ms = today.getTime();
							var date2_ms = dueDate.getTime();
							var difference_ms = date2_ms - date1_ms;
							var days_until_due = Math.ceil(difference_ms/one_day);
							if (days_until_due<0 || days_until_due==0 ) {
								isDue = 1;
							}
						}
						if (isDue==1) return true;
						else return false;
					}
				},
                "Finish": {
					name: "Finish", icon: "fa-check-square-o",
					callback: function(key, options) {
						completeTask();
					},
			        visible: function(key, opt){        
						var myTaskID = currentTask;
						var isStarted = 0;
						var startDay = lines[myTaskID][col_startday];
						if (startDay > 0) {
							var startDate = getStartDate(myTaskID)
							var days_until_start = getDateDifference(today,startDate)
							if (days_until_start<0 || days_until_start==0 ) {
								isStarted = 1;
							}
						}
						else { isStarted = 1; }
						return (isStarted==1);
					}					
				},
                "Edit": {
					name: "Edit", icon: "fa-edit",
					callback: function(key, options) {
						editTaskContextMenu();
					}
				},
                "Delete": {
					name: "Delete", icon: "fa-trash",
					callback: function(key, options) {
						deleteTask();
					}
				},
            }
        };
  
	myOptions.selector = ".task-block"
	myOptions.trigger = button
    $(function() { $.contextMenu(myOptions) });	
}

// INPUT FUNCTIONS

function makeDateIncremented(numDays) {
	today = new Date();
	today = new Date(today.getTime()+numDays*one_day);
	var todaysDateStr = today.toDateString()
	todaysDateStr = todaysDateStr.slice(0,-4)
	$("#todays-date").val(todaysDateStr);
	drawOutput(lines);
	$(".date-button").removeClass("active")
	$("#today-button").addClass("active");
}

function makeShapeDefault() {
	shape = ""
	createCookie('shapeCookie',"");
	$("#shape-button-default").addClass("active")
	$("#shape-button-wide").removeClass("active")
	$(".task-details").show()
	if (document.getElementById("left-side")) document.getElementById("left-side").style.flexBasis = (17.6*maxLength+5.5)+"em"
	$(".row-name").removeClass("wide-row-name")
	$(".row-name").addClass("default-row-name")
	$(".now-task").removeClass("wide-task")
	$(".later-task").removeClass("wide-task")
	$(".now-task").addClass("default-task")
	$(".later-task").addClass("default-task")
}

function makeShapeWide() {
	shape = "wide"
	createCookie('shapeCookie',"wide");
	$("#shape-button-wide").addClass("active")
	$("#shape-button-default").removeClass("active")
	$(".task-details").hide()
	if (document.getElementById("left-side")) document.getElementById("left-side").style.flexBasis = (21.6*maxLength+5.5)+"em"
	$(".row-name").removeClass("default-row-name")
	$(".row-name").addClass("wide-row-name")
	$(".now-task").removeClass("default-task")
	$(".later-task").removeClass("default-task")
	$(".now-task").addClass("wide-task")
	$(".later-task").addClass("wide-task")
}

function editDialogKeypress(e) {
	if (e.which==13) {
		e.preventDefault();
		updateTask(currentTask);
		$("#editDialog").dialog("close");
		makingNewTask = 0;
		isSaved = 0;
		$("#unsaved-changes").show();
		return false;
	}
}

function changeInterval(intVal) {
	$('#incrementpicker').val(intVal)
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
}

function checkInterval() {
	var intVal = $('#incrementpicker').val();
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
}

// EDIT TASK FUNCTIONS

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

function editTaskContextMenu(ev) {
	editTask(currentTask,ev);
}

function clickTaskBlock(ev,target) {
	if (editDebug) console.log("left clicked currentTask="+currentTask)
	if (inRightClickMode==1) {
	}
	else {
		var taskID = target.getAttribute("data-taskid");
		currentTask=taskID;
		editTask(taskID,ev);
	}
}

function cornerClick(ev) {
	if (editDebug) console.log("corner clicked currentTask="+currentTask)
	ev.stopPropagation();
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
	
	var myColor = lines[currentTask][col_color];
	$("#colorpicker").val(myColor);
	if (myColor=="") { document.getElementById("colorpicker2").value = colourNameToHex("LemonChiffon") }
	if (myColor[0]=="#") { document.getElementById("colorpicker2").value = myColor }
	else { 
		var hexColor = colourNameToHex(myColor);
		if (hexColor[0]=="#") { document.getElementById("colorpicker2").value = hexColor }
	}
	$("#rowpicker").val(lines[currentTask][col_row]);
	$("#namepicker").val(lines[currentTask][col_task]);
	$("#incrementpicker").val(lines[currentTask][col_increment]);
	$("#interval-button"+lines[currentTask][col_increment]).addClass("active")
	
	if (makingNewTask==1) var myTitle = "Create New Task"
	else var myTitle = "Edit Task"
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true,
        width: 370,
        height:370,
        title: myTitle,
		resizable: false,
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
				}
				makingNewTask = 0;
				currentTask = 0;
				drawOutput(lines);
			}
		},	
		open: function(event, ui) 
		{ 
			$('.ui-widget-overlay').bind('click', function()
			{ 
				$("#editDialog").dialog('close'); 
			}); 
		},
		close: function( event, ui ) {
			if(makingNewTask==1) {
				lines.splice(currentTask,1);
				lastTaskID--;
			}
			makingNewTask = 0;
			currentTask = 0;
			drawOutput(lines);
		}			
	};
	if (editDebug) console.log("editing taskBlockID="+taskBlockID)

	if (startDay>0 && !dueDay>0) $("#editDialog").dialog("option", { position: {my: "center center", at: "center center", of: myClickEvent, collision: "fit", within: "body"}});
	else $("#editDialog").dialog("option", { position: {my: "center center", at: "center center", of: taskBlockID, collision: "fit", within: "body"}} );

	$("#editDialog").dialog(opt);
	$("#editDialog").dialog("open");
	$("#editDialog").find('button:nth-child(0)').focus();
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

function delayTask() {


	var dueDay = lines[currentTask][col_dueday];
	var dueMonth=lines[currentTask][col_duemonth];
	var dueYear=lines[currentTask][col_dueyear];
	if (dueYear.length==2) dueYear = "20"+dueYear;
	if (dueYear.length==0) dueYear = today.getYear()+1900;
	var dueDate = new Date(dueYear,dueMonth,dueDay);

	var date1_ms = today.getTime();
	var date2_ms = dueDate.getTime();
	var difference_ms = date2_ms - date1_ms;
	var days_until_due = Math.ceil(difference_ms/one_day);

	var newDueDate = new Date(today.getTime() + one_day)
	
	lines[currentTask][col_dueday] = newDueDate.getDate();
	lines[currentTask][col_duemonth] = newDueDate.getMonth()+1;
	if (newDueDate.getYear()==today.getYear()) lines[currentTask][col_dueyear]="";
	else lines[currentTask][col_dueyear] = newDueDate.getYear()+1900;

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


// DRAG AND DROP FUNCTIONS

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
			if (ev.target.getAttribute("data-rowname")==lines[currentTask][col_row].toUpperCase()) {
				toHighlight = 0;
				currentRowName = ev.target.getAttribute("data-rowname")
			}
		}
		currentRowName = ev.target.getAttribute("data-rowname");
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
			currentRowName = "";
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
		currentRowName = ev.target.getAttribute("data-rowname");
		}
	}
	else {
		currentRowName = ""
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
	currentTask = ev.target.getAttribute("data-taskid");
	currentRowName = lines[currentTask][col_row];
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
    var rowName = currentRowName;
	if(draggingNew==1) {
		newTask(rowName,"",1);
		saveFileCookie();
		drawOutput(lines);
	}
    else {
		var taskID = ev.dataTransfer.getData("text");
		if (lines[taskID][col_row].toUpperCase()!==rowName.toUpperCase()) {
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

// CREATION FUNCTIONS
	
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

function newTaskCopy() {
	var newTask = lines[currentTask].slice();
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	newTask[col_complete] = "";

	var startDate = getStartDate(currentTask)
	var dueDate = getDueDate(currentTask)
	var start_offset = dueDate.getTime() - startDate.getTime();
		
	if (startDay>0) {

		var new_startdate = new Date(startDate.getTime() + newTask[col_increment]*one_day);
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
	if (editDebug) console.log("making task "+lines.length+" (taskNum="+lastTaskID);
	newTask[col_ID] = lastTaskID;
	newTask[col_task] = taskName;
	newTask[col_row] = rowName;
	lines.push(newTask);
	drawOutput(lines);
	saveFileCookie();
	if (openMe==1) {
		makingNewTask = 1;
		var myTaskID = lines.length-1
		if (editDebug) console.log("opening new task "+myTaskID+" for editing")
		$("#taskBlock"+myTaskID).click();
		$("#namepicker").focus();
	}
}

// MAIN BUILD FUNCTION

function drawOutput(lines){
	if (typeof lines[0] =="undefined") {return;}
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("div");
	var rowWithMeta = [[],"MISC",[]]
	var tableRows = [rowWithMeta];
	var myMonth;
	var myDay;
	var myYear;
	var clockIconVal;
	var noStartDay;
	var noDueDay;
	maxLength = 0
	
	var myFontSize = $( "#font-size" ).val();
	
	for (var i = 1; i < lines.length; i++) {
		var taskNum = parseInt(lines[i][col_ID]);
		if (isNaN(taskNum)) { continue; }
		if (lines[i][col_complete]=="Yes") { continue; }
		
		if (taskNum>lastTaskID) { lastTaskID = taskNum; }

		var isPastTask = 0;
		
		//Create and Style Task Block
		var taskBlock = document.createElement('div');
		taskBlock.className = "task-block"
		taskBlock.style.fontSize = myFontSize+"px";
		taskBlock.setAttribute("draggable","true");
		taskBlock.setAttribute("ondragstart","drag(event)");
		taskBlock.setAttribute("onmousedown","currentTask="+i+";");
		taskBlock.setAttribute("data-taskid",i);
		taskBlock.setAttribute("onclick","clickTaskBlock(event,this)");
		var colorName = lines[i][col_color];
		if (colorName=="") colorName = "LemonChiffon";
		taskBlock.style.backgroundColor = colorName;
		
		if (colorName.substr(0,1)=="#") var myHexColor = colorName
		else var myHexColor = colourNameToHex(colorName)

		if (myHexColor) var myTextColor = getContrastYIQ(myHexColor)
		else myTextColor = "black"
		
		taskBlock.style.color = myTextColor
		
		var myName = lines[i][col_task].replace("%44;",",");
		var name = document.createElement("div");
		name.innerHTML = "<b>"+myName+"</b>";
		
		
		var startDay=lines[i][col_startday];
		var dueDay=lines[i][col_dueday];
		
		var days_until_start = "";
		var days_until_due = "";

		clockIconVal = 0;
		noStartDay = 0;
		
		var cornerButton = document.createElement("div")
		cornerButton.style = "float:right;position:absolute;right:0;"
		cornerButton.className = "corner-button"
		cornerButton.setAttribute("onclick","cornerClick(event)")
		cornerButton.innerHTML = '<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>';
		//taskBlock.appendChild(cornerButton)
		
		if (startDay>0) {
			var startDate = getStartDate(i);
			var startDateStr = startDate.toDateString();
			startDateStr = startDateStr.substring(0,startDateStr.length-4);
			var days_until_start = getDateDifference(today,startDate)
			if (days_until_start==0) {
				taskRow = document.createElement("span");
				taskRow.innerHTML = "<b>Starts TODAY</b>";
				taskRow.className = "task-details"
				name.setAttribute("style","height:1.5em;width:14em;text-align:center;")
				taskBlock.appendChild(name);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);				
				taskBlock.appendChild(taskRow);
				taskBlock.className += " now-task";
				if (shape=="wide") taskBlock.className += " wide-task";
				else taskBlock.className += " default-task";
			}
			else if (startDate>today) {
				var startDatePhrase = document.createElement("span")
				startDatePhrase.innerHTML = "Start: "+startDateStr+" (wait "+days_until_start+")"
				startDatePhrase.className = "task-details"
				name.setAttribute("style","height:1.5em;width:15em;text-align:center;")
				taskBlock.appendChild(name);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);				
				taskBlock.appendChild(startDatePhrase);
				taskBlock.className += " later-task";
				if (shape=="wide") taskBlock.className += " wide-task";
				else taskBlock.className += " default-task";
			}
			else if (startDate<today && !dueDay>0) {
				isPastTask = 1;

				name.setAttribute("style","height:1.2em;display:inline-block;")
				taskBlock.appendChild(name);

				var justDate = document.createElement("span");
				justDate.className = "task-details"
				justDate.innerHTML = startDateStr;
				justDate.setAttribute("style","display:inline-block;margin-left:1em;")
				taskBlock.appendChild(justDate);

				var myOpacity = (-days_until_start)*0.1;
				if (myOpacity>1) myOpacity = 1;
				
				taskBlock.className += " past-task";

				var iconSpan = document.createElement("span")
				if (lines[i][col_increment]>0) iconSpan.setAttribute("style","display:inline-block;margin-left:1em;margin-right:1.5em;")
				else iconSpan.setAttribute("style","display:inline-block;margin-left:1em;")
				for(var k=0;k<(-days_until_start);k++) {
					var clockIcon = document.createElement("div");
					clockIcon.className = "clock-icon"
					//clockIcon.setAttribute("style","opacity:"+myOpacity+";")
					clockIcon.setAttribute("style","display:inline-block;margin:1px;");
					clockIcon.innerHTML = '<i class="fa fa-clock-o" aria-hidden="true" ></i>';
					iconSpan.appendChild(clockIcon);
				}
				taskBlock.appendChild(iconSpan)
			}
			else {
				taskBlock.className += " now-task";
				if (shape=="wide") taskBlock.className += " wide-task";
				else taskBlock.className += " default-task";
				name.setAttribute("style","height:1.5em;")
				taskBlock.appendChild(name);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
			}
		}
		else {
			noStartDay = 1;
			taskBlock.className += " now-task";
			if (shape=="wide") taskBlock.className += " wide-task";
			else taskBlock.className += " default-task";
			name.setAttribute("style","height:1.5em;")
			taskBlock.appendChild(name);
			var BR = document.createElement("br");
			taskBlock.appendChild(BR);		
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
			var date1_ms = today.getTime();
			var date2_ms = dueDate.getTime();
			var difference_ms = date2_ms - date1_ms;
			var days_until_due = Math.ceil(difference_ms/one_day);

			if (days_until_due==0) {
				taskRow = document.createElement("b");
				taskRow.appendChild(document.createTextNode("Due TODAY"));
				taskRow.className = "task-details"
				taskBlock.appendChild(taskRow);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				
				var alertIcon = document.createElement("div");
				alertIcon.className = " alert-icon";
				alertIcon.setAttribute("style","margin-left:0.3em;")
				alertIcon.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);
				
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);
			}
			else if (days_until_due<0) {
				var dueDatePhrase = document.createElement("div")
				dueDatePhrase.setAttribute("class","task-details")
				dueDatePhrase.innerHTML = "Due: "+dueDateStr+" ("+(-days_until_due)+" passed)";
				taskBlock.appendChild(dueDatePhrase);

				var alertIcon = document.createElement("div");
				alertIcon.className = "alert-icon";
				alertIcon.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);

				taskRow = document.createElement("b");
				taskRow.className = "task-details"
				taskRow.innerHTML = "!!! OVERDUE !!!"
				var BR = document.createElement("br");
				taskBlock.appendChild(BR);		
				taskBlock.appendChild(taskRow);


			}
			else {
				var dueDatePhrase = document.createElement("div");
				dueDatePhrase.setAttribute("class","task-details")
				dueDatePhrase.innerHTML = "Due: "+dueDateStr
				if (!startDay>0 || startDate<=today) {
					dueDatePhrase.innerHTML += " ("+days_until_due+" left)"
					taskBlock.appendChild(dueDatePhrase)
					var countdownIcon = createCountdownIcon(days_until_due)
					taskBlock.appendChild(countdownIcon);
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
			var repeatIcon = createRepeatIcon(i,isPastTask)
			taskBlock.appendChild(repeatIcon);
		};

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
			var rowWithMeta = [[],rowName,[]];
			tableRows.push(rowWithMeta);
		}

		//if (startDay>0 && !dueDay>0) { days_until_due = days_until_start; }

		var myTaskName = lines[i][col_task]
		if (myTaskName.length==0) { myTaskName = "ZZZZZ" }
		
		var taskBlockID = "taskBlock"+i;
		taskBlock.id = taskBlockID;
		
		var taskWithMeta = [ days_until_start, days_until_due , myTaskName , taskBlock , isPastTask ];
		if (isPastTask) tableRows[rowNum][2].push(taskWithMeta);
		else tableRows[rowNum][0].push(taskWithMeta);
	}
	

	for (row = 1 ; row<tableRows.length ; row++) {
		if (tableRows[row][0]) {
			if (sortDebug) console.log("Sorting Row "+tableRows[row][1]+" (current tasks)")
			tableRows[row][0].sort(mySortFunction);
		}
		if (tableRows[row][2]) {
			if (sortDebug) console.log("Sorting Row "+tableRows[row][1]+" (past tasks)")
			tableRows[row][2].sort(mySortFunction);
		}
	}

	if (sortDebug) console.log("Sorting Rows")
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
		if (shape=="wide") thisRowName.className += " wide-row-name";
		else thisRowName.className += " default-row-name";
		

		var tableBar = document.createElement("div");
		tableBar.setAttribute("class","table-bar")
		tableBar.setAttribute("style","margin:0px;")
		var tableContents = document.createElement("div");
		tableContents.setAttribute("class","table-contents")
		
		if (tableRows[row][2].length>0) {
			for (n = 0 ; n<tableRows[row][2].length ; n++) {
				hasTableBar = 1;
				tableBar.append(tableRows[row][2][n][3]);
			}		
			tableRow.append(tableBar);
		}
		
		tableRow.append(thisRowName);
		tableRow.setAttribute("data-rowname",tableRows[row][1])

		if (tableRows[row][0].length>0) {
			for (n = 0 ; n<tableRows[row][0].length ; n++) {
				tableContents.append(tableRows[row][0][n][3]);
			}
			tableRow.append(tableContents);
		}

		if (tableRows[row][0].length>maxLength) { maxLength=tableRows[row][0].length; }
	
		table.append(tableRow);
	}
		
	table.className = "left-side";
	table.id = "left-side";
	table.setAttribute("draggable","false")
	if (shape=="wide") table.style.flexBasis = 21.6*maxLength+5.5+"em";
	else table.style.flexBasis = 17.6*maxLength+5.5+"em";
	
	tableRows[0][0].sort(mySortFunction);

	var miscBar = document.createElement("div");
	miscBar.setAttribute("class","table-bar")
	var miscContents = document.createElement("div");
	miscContents.setAttribute("class","table-contents")

	var hasTableBar = 0;
	for (n = 0 ; n<tableRows[0][2].length ; n++) {
		hasTableBar = 1;
		miscBar.append(tableRows[0][2][n][3]);
	}	
	
	var miscTasks = document.createElement("div");
	if (hasTableBar) {
		miscTasks.append(miscBar);
	}

	for (n = 0 ; n<tableRows[0][0].length ; n++) {
		miscContents.append(tableRows[0][0][n][3]);
	}		
	
	miscTasks.append(miscContents);
	
	miscTasks.className = "misc-block normal-row";
	miscTasks.id = "misc-block";
	miscTasks.setAttribute("draggable","false")

	miscTasks.setAttribute("data-rowname","")
	miscTasks.setAttribute("ondrop","drop(event)");
	miscTasks.setAttribute("ondragenter","highlightMisc(event)");
	miscTasks.setAttribute("ondragleave","unhighlightMisc(event)");
	
	document.getElementById("output").append(table);
	document.getElementById("output").append(miscTasks);

	if (shape=="wide") $(".task-details").hide();

	document.getElementById("output").style =	"width:100%;display:flex;flex-direction:row;font-size:"+myFontSize+"px;"
	
	$(".task-row").dblclick( function (){
		var rowName = this.getAttribute("data-rowname");
		if (editDebug) console.log("double-clicked row "+rowName)
		newTask(rowName,"",1);
	});
	$(".misc-block").dblclick( function (){
		if (editDebug) console.log("double-clicked misc block")
		newTask("","",1);
	});
	$(".task-row").on("taphold", function (){
		e.preventDefault();
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
		return false;
	});
	$(".misc-block").on("taphold", function (){
		e.preventDefault();
		var rowName = this.getAttribute("data-rowname");
		newTask(rowName);
		return false;
	});
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
	if (clockIconLabel.length==1) clockIconNum.setAttribute("style","margin-left:2px;opacity:"+myOpacity+";")
	else clockIconNum.setAttribute("style","opacity:"+myOpacity+";")
	clockIconNum.innerHTML = clockIconLabel;
	countdownIcon.appendChild(clockIconNum);	
	
	return countdownIcon;
}

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

	var link = document.createElement("a");

	//var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	//var url = URL.createObjectURL(blob);

	var encodedUri = encodeURI(csvContent);
	var url = "data:attachment/csv,"+encodedUri;

	link.setAttribute("href", url);
	link.setAttribute("download", currentFileName);
	document.body.appendChild(link); // Required for FF
	link.click();
	
	isSaved = 1;
	$("#unsaved-changes").hide();
	createCookie("isSaved",1);
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

// SORTING FUNCTIONS

function myRowSortFunction(a,b) {	
	var compareString = a[1]+" vs "+b[1];
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
	
	/*if (a[0]<0 && a[1].length==0) a[1]=-a[0]+0.1;
	if (b[0]<0 && b[1].length==0) b[1]=-b[0]+0.1;*/

	if (a[0].length==0) a[0]=-999;
	if (b[0].length==0) b[0]=-999;
	
	if (sortDebug) var compareString = a[0]+"/"+a[1]+"/"+a[2]+" vs "+b[0]+"/"+b[1]+"/"+b[2];

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
	if (sortDebug) { console.log(compareString + " = " + returnVal); }
	return returnVal;
}

  
