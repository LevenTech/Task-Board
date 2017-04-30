
var myClickEvent;

var sortDebug = 0;
var editDebug = 0;

var lines = [];

var shape = "";
var inRightClickMode = 0;
var dateSliderActive = 0;

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
var makingNewTask;

var simulateMobile = 0;

document.onselectstart = function() { return false; };
$(document).ready(function() {

	initDialogs();
	initKeys();

	initShapePicker();
	initFontSlider();
	initDateSlider();

	initContextMenu("right")
	if (isMobile()) { initRightClickMode() }
	if (isMobile()) { initToolSelector() }
	
	loadCookieFile();

	$.ui.dialog.prototype._focusTabbable = function(){};
	
	$(document).on('mousedown', '.task-block', function (e){ 
		myClickEvent = e
		return true; 
	});
	
$(window).scroll(function(){
    
	console.log("scrolling to "+$(window).scrollTop())
	if ($(window).scrollTop() > 66) {
		$("#taskboard-toolbar").removeClass("moving-toolbar");
		$("#taskboard-toolbar").addClass("stuck-toolbar");
	} else {
		$("#taskboard-toolbar").removeClass("stuck-toolbar");
		$("#taskboard-toolbar").addClass("moving-toolbar");
	}
  
});	
	
});

// INIT FUNCTIONS

function initToolSelector () {

	$(".toolbar-selection").hide();
	$("#tool-select-control").show();
	$("#middle-buttons").show();
	document.getElementById("left-buttons").style.flexBasis = "1em";
	document.getElementById("left-buttons").style.flexGrow = "0";
	document.getElementById("left-buttons").style.flexShrink = "0";
	document.getElementById("middle-buttons").style.flexBasis = "8em";
	document.getElementById("new-task-drag").style.marginTop = "0.4em";
	document.getElementById("new-task-drag").style.paddingTop = "1em";
	document.getElementById("new-task-drag").innerHTML = "New";
	$("#right-buttons").show();
	$("#tool-selector").change(function(){
		createCookie("selected-tool",this.value)
		$(".toolbar-selection").hide();
		$("#right-buttons").append($("#"+this.value))
		$("#"+this.value).show();
		document.getElementById(this.value).style.fontSize = "25px";
	});
	
	var alreadySelected = readCookie("selected-tool");
	if (!alreadySelected) alreadySelected = "new-open-file"
	$("#tool-selector").val(alreadySelected)
	$(".toolbar-selection").hide();
	$("#right-buttons").append($("#"+alreadySelected))
	$("#"+alreadySelected).show();
	document.getElementById(alreadySelected).style.fontSize = "25px";
	$(".newfile-button")
	document.getElementById("newfile-button").style.fontSize = "20px"
	document.getElementById("newfile-button-label").innerHTML = "New"
	document.getElementById("openfile-button").style.fontSize = "20px"
	document.getElementById("openfile-button-label").innerHTML = "Open"
	
	$("#taskboard-toolbar").addClass("padded-toolbar");
	$("#taskboard-toolbar").addClass("moving-toolbar");
	$("#output").addClass("padded-output");
	$("#app-header").addClass("padded-app-header");
}

function initDialogs() {
	var opt = { autoOpen: false	};
 
	$("#editDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$("#deleteDialog").dialog(opt).dialog("close");

	$(".my-dialog").show();	
}

function initKeys() {
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

	$(document).on('keydown keyup',  function (e) {
		if ($('#completeDialog').is(':visible')) {
			var key = e.which;
			if (key == 13) {
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
			}
			else if (key == 27) {
				$("#completeDialog").dialog("close");
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
			}
		}
		if ($('#deleteDialog').is(':visible')) {
			var key = e.which;
			if (key == 13) {
				lines.splice(currentTask,1);
				$("#deleteDialog").dialog("close");
				$("#editDialog").dialog("close");
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
			}
			else if (key == 27) {
				$("#deleteDialog").dialog("close");
			}
		}
		e.stopPropagation();
	});	
}

function initRightClickMode() {
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

function initShapePicker() {
	var shapeCookie = readCookie('shapeCookie');
	if (shapeCookie=="wide") {
		$("#shape-button-wide").addClass("active")
		makeShapeWide()
	}
	else {
		$("#shape-button-default").addClass("active")
	}	
}

function initFontSlider() {
	var cookieVal = readCookie('zoomCookie');
	if (cookieVal) {	var sliderValue = cookieVal;	}
	else { 				var sliderValue = 14; 			}
	$( "#font-size" ).val(sliderValue);
	
	var myFontSizeSlider = document.getElementById('font-size-slider');
	noUiSlider.create(myFontSizeSlider, {
		start: [sliderValue],
		step: 2,
		connect: true,
		range: { 'min': 8, 'max': 36 }
	});

	myFontSizeSlider.noUiSlider.on('slide', function(){
		var sliderValue = Math.floor(document.getElementById('font-size-slider').noUiSlider.get());
		createCookie('zoomCookie',sliderValue);
		$( "#font-size" ).val(sliderValue);
		document.getElementById("output").style = "font-size:"+sliderValue+"px;"
	})
}
	
function initDateSlider() {
	var todaysDateStr = today.toDateString()
	todaysDateStr = todaysDateStr.slice(0,-4)
	$("#todays-date").val(todaysDateStr);
	
	var myTodaysDateSlider = document.getElementById('todays-date-slider');
	noUiSlider.create(myTodaysDateSlider, {
		start: [0],
		step: 1,
		behavior: "tap-drag",
		connect: true,
		range: { 'min': 0, 'max': 7 }
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
					callback: function(key, options) {	delayTask(currentTask);	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_dueday] < 1) return false;
						var dueDate = getDueDate(currentTask);
						var days_until_due = getDateDifference(today,dueDate)
						if (days_until_due<0 || days_until_due==0 ) return true;
						return false;
					}
				},
                "Finish": {
					name: "Finish", icon: "fa-check-square-o",
					callback: function(key, options) {	completeTask();	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_startday] < 1) return true;
						var startDate = getStartDate(currentTask)
						var days_until_start = getDateDifference(today,startDate)
						if (days_until_start<0 || days_until_start==0 ) return true;
						return false;
					}					
				},
                "Edit": {
					name: "Edit", icon: "fa-edit",
					callback: function(key, options) {	editTaskContextMenu();	}
				},
                "Delete": {
					name: "Delete", icon: "fa-trash",
					callback: function(key, options) {	deleteTask();	}
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
	console.log("#interval-button"+intVal)
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
}

// EDIT TASK FUNCTIONS

function completeTask(wasDropped) {

	$("#deleteDialog").dialog("close");
	
	var opt = {
        autoOpen: false,
        modal: true,
        width: 350,
        height:350,
        title: 'Finish Task',
		position: {my: "center center", at: "center center", of: "#taskBlock"+currentTask, collision: "fit", within: "body"},
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
		},
		open: function() { $("#completeDialog").find('button:nth-child(0)').focus(); }
    };
	if (wasDropped) opt.position = {my: "top right", at: "top right", of: "#finish-area", collision: "fit", within: "body"};
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
		position: {my: "center center", at: "center center", of: "#taskBlock"+currentTask, collision: "fit", within: "body"},
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
		},
		open: function() { $("#deleteDialog").find('button:nth-child(1)').focus(); }
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
	checkColor();

	$("#incrementpicker").val(lines[currentTask][col_increment]);
	checkInterval();

	$("#namepicker").val(lines[currentTask][col_task]);
	
	if (makingNewTask==1) var myTitle = "Create New Task"
	else var myTitle = "Edit Task"
	
	var taskBlockID = "#taskBlock"+taskID;
	var opt = {
        autoOpen: false,
        modal: true, resizable: false,
        height:400, width: 400,
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
	checkColor();
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
    var newRowName = currentRowName;
	if(draggingNew==1) {
		newTask(newRowName,"",1);
		saveFileCookie();
		drawOutput(lines);
	}
    else {
		var taskID = ev.dataTransfer.getData("text");
		if (lines[taskID][col_row].toUpperCase()!==newRowName.toUpperCase()) {
			lines[taskID][col_row]=newRowName;
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
	completeTask(1);
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
		position: {my: "center center", at: "center center", of: ev, collision: "fit", within: "body"},
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
		
	if (startDate) {

		var new_startdate = new Date(startDate.getTime() + newTask[col_increment]*one_day);
		newTask[col_startmonth] = new_startdate.getMonth()+1;
		newTask[col_startday] = new_startdate.getDate();
		newTask[col_startyear] = new_startdate.getYear()+1900;
		
		if(dueDate) {
			var new_duedate = new Date(new_startdate.getTime() + start_offset);
			newTask[col_duemonth] = new_duedate.getMonth()+1;
			newTask[col_dueday] = new_duedate.getDate();
			newTask[col_dueyear] = new_duedate.getYear()+1900;
		}
	}
	else if (dueDate) {
		var new_duedate = new Date(today.getTime() + newTask[col_increment]*one_day);
		newTask[col_duemonth] = new_duedate.getMonth()+1;
		newTask[col_dueday] = new_duedate.getDate();
		newTask[col_dueyear] = new_duedate.getYear()+1900;
	}

	lines.push(newTask);
	drawOutput(lines);
	isSaved = 0;
	$("#unsaved-changes").show();
	saveFileCookie();
}

function newTask(rowName,taskName,openMe) {
	var newTask = ["","","","","","","","","","","",""];
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

	var rowWithMeta = [[],"MISC",[]]
	var tableRows = [rowWithMeta];
	
	for (var i = 1; i < lines.length; i++) {
		var taskNum = parseInt(lines[i][col_ID]);
		if (isNaN(taskNum)) { continue; }
		if (lines[i][col_complete]=="Yes") { continue; }
		
		if (taskNum>lastTaskID) { lastTaskID = taskNum; }

		var isPastTask = 0;
		
		var taskBlock = createTaskBlock(i,lines[i][col_color])
		
		var myName = lines[i][col_task].replace("%44;",",");
		var name = document.createElement("div");
		name.className = "task-name"
		name.innerHTML = "<b>"+myName+"</b>";
		taskBlock.appendChild(name)
		
		var startDay=lines[i][col_startday];
		var dueDay=lines[i][col_dueday];
		var days_until_start = "";
		var days_until_due = "";
		if (startDay>0) {
			var startDate = getStartDate(i);
			var startDateStr = startDate.toDateString();
			startDateStr = startDateStr.substring(0,startDateStr.length-4);
			startDateStr = startDateStr.replace("0","")
			var days_until_start = getDateDifference(today,startDate)
			var startDatePhrase = document.createElement("span");
			startDatePhrase.className = "task-details start-date"
			if (startDate<today && !dueDay>0) {
				isPastTask = 1;
				taskBlock.className += " past-task";

				startDatePhrase.innerHTML = startDateStr;
				taskBlock.appendChild(startDatePhrase);

				var myOpacity = (-days_until_start)*0.1;
				if (myOpacity>1) myOpacity = 1;

				var iconSpan = document.createElement("span")
				iconSpan.className = "icon-span"
				if (lines[i][col_increment]>0) iconSpan.className += " icon-margin"
				for(var k=0;k<(-days_until_start);k++) {
					var clockIcon = document.createElement("div");
					clockIcon.className = "clock-icon"
					clockIcon.innerHTML = '<i class="fa fa-clock-o" aria-hidden="true" ></i>';
					iconSpan.appendChild(clockIcon);
				}
				taskBlock.appendChild(iconSpan)
			}
			else {
				taskBlock.appendChild(createBR());				
				if (days_until_start<1) {
					if (days_until_start==0) startDatePhrase.innerHTML = "<b>Starts TODAY</b>";
					taskBlock.className += " now-task";
				}
				else {
					startDatePhrase.innerHTML = "Start: "+startDateStr+" (wait "+days_until_start+")"
					taskBlock.className += " later-task";
				}
				taskBlock.appendChild(startDatePhrase);
			}
		}
		else {
			taskBlock.className += " now-task";
			taskBlock.appendChild(createBR());		
		}

		if (isPastTask==0) {
			if (shape=="wide") taskBlock.className += " wide-task";
			else taskBlock.className += " default-task";
		}
		
		if (dueDay > 0) {
			var dueDate = getDueDate(i)
			var dueDateStr = dueDate.toDateString();
			dueDateStr = dueDateStr.substring(0,dueDateStr.length-4);
			dueDateStr = dueDateStr.replace("0","")
			var days_until_due = getDateDifference(today,dueDate)

			var dueDatePhrase = document.createElement("div")
			dueDatePhrase.className = "task-details"
			taskBlock.appendChild(createBR());		

			if (days_until_due==0) {
				dueDatePhrase.style.fontWeight = "bold"
				dueDatePhrase.innerHTML = "Due TODAY";
				taskBlock.appendChild(dueDatePhrase);
				
				var alertIcon = document.createElement("div");
				alertIcon.className = "alert-icon alert-indent";
				alertIcon.innerHTML = '<i class="fa fa-exclamation" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);
			}
			else if (days_until_due<0) {
				dueDatePhrase.innerHTML = "Due: "+dueDateStr+" ("+(-days_until_due)+" passed)";
				taskBlock.appendChild(dueDatePhrase);

				var alertIcon = document.createElement("div");
				alertIcon.className = "alert-icon";
				alertIcon.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true" ></i>';
				taskBlock.appendChild(alertIcon);

				var overDue = document.createElement("b");
				overDue.className = "task-details"
				overDue.innerHTML = "!!! OVERDUE !!!"
				taskBlock.appendChild(createBR());		
				taskBlock.appendChild(overDue);
			}
			else {
				dueDatePhrase.innerHTML = "Due: "+dueDateStr
				if (!startDay>0 || startDate<=today) {
					dueDatePhrase.innerHTML += " ("+days_until_due+" left)"
					taskBlock.appendChild(dueDatePhrase)
					taskBlock.appendChild(createCountdownIcon(days_until_due));
				}
			}
		}

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

		var myTaskName = lines[i][col_task]
		if (myTaskName.length==0) { myTaskName = "ZZZZZ" }
		
		var taskWithMeta = [ days_until_start, days_until_due , myTaskName , taskBlock ];
		if (isPastTask) tableRows[rowNum][2].push(taskWithMeta);
		else tableRows[rowNum][0].push(taskWithMeta);
	}
	
	document.getElementById("output").innerHTML = "";
	document.getElementById("output").append(createTable(tableRows));
	document.getElementById("output").append(createMiscBlock(tableRows));
	document.getElementById("output").style =	"font-size:"+$( "#font-size" ).val()+"px;"

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

// ELEMENT CREATION FUNCTIONS

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
	if (colorName=="") colorName = "LemonChiffon";
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

	if (sortDebug) console.log("Sorting Rows")
	tableRows.sort(myRowSortFunction);
	
	for (row = 1 ; row<tableRows.length ; row++) {
		var tableRow = document.createElement("div");
		tableRow.setAttribute("id","task-row-"+tableRows[row][1]);
		tableRow.className = "task-row normal-row";
		tableRow.setAttribute("data-rowname",tableRows[row][1])
		tableRow.setAttribute("draggable","false");
		tableRow.setAttribute("ondrop","drop(event)");
		tableRow.setAttribute("ondragenter","highlightRow(event)");
		tableRow.setAttribute("ondragleave","unhighlightRow(event)");
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
	miscTasks.append(createRowContents(tableRows[0]));
	return miscTasks;
}

function createRowContents(myRowArray,myRowName) {
	myRowArray[0].sort(mySortFunction);
	myRowArray[2].sort(mySortFunction);

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

  
