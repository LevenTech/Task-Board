
var myClickEvent;

var sortDebug = 0;
var editDebug = 0;
var simulateMobile = 0;

var lines = [];

var shape = "";
var inRightClickMode = 0;
var dateSliderActive = 0;

var today = new Date();
var one_day=1000*60*60*24;
var one_hour=1000*60*60;

var currentFileName = "newTaskFile.csv";
var showFinished = 0;
var isSaved = 1;
var lastTaskID = 0;
var currentTask = 0;
var currentTaskDateSync = 0;
var currentRowName = "";
var isTestFile = 0;
var testFileDateDiff;

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
var	col_starttime = 12;
var	col_duetime = 13;

var dragcounter = 0;
var draggingNew = 0;
var makingNewTask;


document.onselectstart = function() { return false; };
$(document).ready(function() {

	initDialogs();
	initDateSyncing();
	initKeys();

	initShapePicker();
	initFontSlider();
	initDateSlider();

	$.contextMenu( 'destroy' );
	initRowContextMenu()
	initContextMenu("right")

	if (isMobile()) { initRightClickMode() }
	if (isMobile()) { initToolSelector() }
	
	loadCookieFile();

	$.ui.dialog.prototype._focusTabbable = function(){};
	
	$(document).on('mousedown', '.task-block', function (e){ 
		myClickEvent = e
		return true; 
	});
	$(document).on('mousedown', '.task-row', function (e){ 
		myClickEvent = e
		return true; 
	});
	
	$(window).scroll(function(){
		if ($(window).scrollTop() > 66) {
			$("#taskboard-toolbar").removeClass("moving-toolbar");
			$("#taskboard-toolbar").addClass("stuck-toolbar");
		}
		else {
			$("#taskboard-toolbar").removeClass("stuck-toolbar");
			$("#taskboard-toolbar").addClass("moving-toolbar");
		}
	});	
	
	setInterval(checkTime,60000)
	
	var showFinishedCookie = readCookie("showFinished")
	if (showFinishedCookie==1) toggleFinishedVisible()

});

$(window).on('resize', function(){
	width = $(this).width();
});

function toggleFinishedVisible() {
	if ($('#show-finished').is(':checked')) {
		document.getElementById("show-finished").checked = false;
		$("#delete-finished-button").hide();
		showFinished = 0;
		createCookie("showFinished",0)
	}
	else {
		document.getElementById("show-finished").checked = true;
		$("#delete-finished-button").show();
		showFinished = 1;
		createCookie("showFinished",1)
	}
	drawOutput(lines)
}

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
	document.getElementById("output").marginTop = "30px";
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
	//$("#output").addClass("padded-output");
	$("#app-header").addClass("padded-app-header");
}

function initDialogs() {
	var opt = { autoOpen: false	};
 
	initEditDialog();
	$("#editDialog").dialog(opt).dialog("close");
	$("#completeDialog").dialog(opt).dialog("close");
	$("#uncompleteDialog").dialog(opt).dialog("close");
	$("#newRowDialog").dialog(opt).dialog("close");
	$("#renameRowDialog").dialog(opt).dialog("close");
	$("#saveDialog").dialog(opt).dialog("close");
	$("#deleteDialog").dialog(opt).dialog("close");
	$("#deleteFinishedDialog").dialog(opt).dialog("close");

	$(".my-dialog").show();	
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


function initKeys() {
	$("#datepicker-start").keypress( function (e) { return editDialogKeypress(e); });
	$("#datepicker-due").keypress( function (e) { return editDialogKeypress(e); });
	$("#timepicker-start").keypress( function (e) { return editDialogKeypress(e); });
	$("#timepicker-due").keypress( function (e) { return editDialogKeypress(e); });
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
	$("#renamedRowName").keypress( function (e) {
		if(e.which == 13) {
			$("#renameRowDialog").dialog("close");
			e.preventDefault();
			var oldRowName = document.getElementById("current-row-name").innerHTML
			var newRowName = $("#renamedRowName").val();
			for (var currentTask = 1; currentTask<lines.length; currentTask++) {
				var currentRowName = lines[currentTask][col_row]
				if (currentRowName) {
					if (currentRowName.toUpperCase()==oldRowName) {
						lines[currentTask][col_row]=newRowName;
					}
				}
			}
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
				$("#show-finished-toggle").show();
			}
			else if (key == 27) {
				$("#completeDialog").dialog("close");
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
				$("#show-finished-toggle").show();
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
	.addGesture(Fingers.gesture.Tap, { nbFingers: 2})
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
	$("#todays-date").val(makeDateStr(today)+","+makeTimeStrFromDate(today));
	
	var myTodaysDateSlider = document.getElementById('todays-date-slider');
	noUiSlider.create(myTodaysDateSlider, {
		start: [0],
		step: 1,
		behavior: "tap-drag",
		connect: true,
		range: { 'min': 0, 'max': 178 }
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
	var myOptions = {
            selector: '.task-block', 
			className: 'my-context-menu',
			events: {
				hide: function(opt) {
					if (isMobile()) {
						inRightClickMode = 0;
						$("#right-click-mode-indicator").hide();
						initContextMenu("right")
					}
				}
			},
			items: {
                "SnoozeMenu": {
					name: "Snooze", icon: "fa-bell-slash-o",
					items: {
						"snooze-key1": {"name":"1 hour", callback: function(key, options) {	delayTask(1);	}, visible: function(key,opt){if (lines[currentTask][col_duetime] == null || lines[currentTask][col_duetime] == "") return false; else return true;}},
						"snooze-key2": {"name":"2 hours", callback: function(key, options) {	delayTask(2);	}, visible: function(key,opt){if (lines[currentTask][col_duetime] == null || lines[currentTask][col_duetime] == "") return false; else return true;}},
						"snooze-key4": {"name":"4 hours", callback: function(key, options) {	delayTask(4);	}, visible: function(key,opt){if (lines[currentTask][col_duetime] == null || lines[currentTask][col_duetime] == "") return false; else return true;}},
						"snooze-key12": {"name":"12 hours", callback: function(key, options) {	delayTask(12);	}, visible: function(key,opt){if (lines[currentTask][col_duetime] == null || lines[currentTask][col_duetime] == "") return false; else return true;}},
						"snooze-key1d": {"name":"1 day", callback: function(key, options) {	delayTask(24);	}},
						"snooze-key2d": {"name":"2 days", callback: function(key, options) {	delayTask(48);	}},
						"snooze-key3d": {"name":"3 days", callback: function(key, options) {	delayTask(72);	}},
						"snooze-key1w": {"name":"1 week", callback: function(key, options) {	delayTask(168);	}},
					},
					callback: function(key, options) {	delayTask(24);	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_complete] == "Yes") return false;
						if (lines[currentTask][col_dueday] == null || lines[currentTask][col_dueday] == "") return false;
						var dueDate = getDueDate(currentTask);
						var days_until_due = getDateDifference(today,dueDate)
						if (days_until_due<0 || days_until_due==0 ) {
							if (lines[currentTask][col_startday] == null || lines[currentTask][col_startday] == "") return true;
							else {
								var startDate = getStartDate(currentTask)
								var days_until_start = getDateDifference(today,startDate)
								if (days_until_start<0) return true;
								if (days_until_start==0) {
									var startOfToday = new Date(today.getTime());
									startOfToday.setHours(0,0,0,0);
									var now_mseconds = today.getTime()-startOfToday.getTime();
									var timeParts = lines[currentTask][col_starttime].split(":")
									var start_mseconds = (timeParts[0]*60*60+timeParts[1]*60)*1000;
									var time_until_start = start_mseconds-now_mseconds;
									if (time_until_start>60*60*1000) return false;
									else return true;
								}
							}
						}
						return false;
					}
				},
                "Finish": {
					name: "Finish", icon: "fa-check-square-o",
					callback: function(key, options) {	completeTask();	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_complete] == "Yes") return false;
						if (lines[currentTask][col_startday] == null || lines[currentTask][col_startday] == "") return true;
						var startDate = getStartDate(currentTask)
						var days_until_start = getDateDifference(today,startDate)
						if (days_until_start<0 || days_until_start==0 ) {
							if (lines[currentTask][col_startday] < 1) return true;
							else {
								var startDate = getStartDate(currentTask)
								var days_until_start = getDateDifference(today,startDate)
								if (days_until_start<0) return true;
								if (days_until_start==0) {
									var startOfToday = new Date(today.getTime());
									startOfToday.setHours(0,0,0,0);
									var now_mseconds = today.getTime()-startOfToday.getTime();
									var timeParts = lines[currentTask][col_starttime].split(":")
									var start_mseconds = (timeParts[0]*60*60+timeParts[1]*60)*1000;
									var time_until_start = start_mseconds-now_mseconds;
									if (time_until_start>0) return false;
									else return true;
								}
							}
						}
						return false;
					}					
				},
                "Un-Finish": {
					name: "Un-Finish", icon: "fa-check-square-o",
					callback: function(key, options) {	uncompleteTask();	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_complete] == "Yes") return true;
						else return false;
					}					
				},				
                "Edit": {
					name: "Edit", icon: "fa-edit",
					callback: function(key, options) {	editTaskContextMenu();	}
				},
                "Put in Group": {
					name: "Put in Group", icon: "fa-folder-o",
					callback: function(key, options) {	newRowMenu();	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_row] == "") return true;
						else return false;
					}						},				
                "Change Group": {
					name: "Change Group", icon: "fa-folder-o",
					callback: function(key, options) {	newRowMenu();	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_row] == "") return false;
						else return true;
					}						},				
                "Delete": {
					name: "Delete", icon: "fa-trash",
					callback: function(key, options) {	deleteTask();	}
				},
            }
        };
  
	myOptions.trigger = button
    $(function() { $.contextMenu(myOptions) });	
}

function initRowContextMenu() {
	var myOptions = {
            selector: '.task-row, .misc-block', 
			className: 'my-row-context-menu',
			events: {
				hide: function(opt) {
					if (isMobile()) {
						inRightClickMode = 0;
						$("#right-click-mode-indicator").hide();
						initContextMenu("right")
					}
				}
			},
			items: {
                "New Task": {
					name: "New Task", icon: "fa-clone",
					callback: function(key, options) {	newTask(options.$trigger.attr("data-rowname"),"",1);	},
			        visible: function(key, opt){        
						return true;
					}
				},
                "Rename Row": {
					name: "Rename Row", icon: "fa-edit",
					callback: function(key, options) {	renameRow(options.$trigger.attr("data-rowname"),"",1);	},
			        visible: function(key, opt){     
						if (opt.$trigger) {
							if (opt.$trigger.attr("data-rowname")=="") return false;
						}
						return true;
					}
				}
            }
        };
    $(function() { $.contextMenu(myOptions) });	
}

function renameRow(rowName) {
	document.getElementById("current-row-name").innerHTML = rowName
	$("#renamedRowName").val("");
	var opt = {
        autoOpen: false,
        modal: true,
        width: 350,
        height:200,
        title: 'Rename Task Group',
		position: {my: "center center", at: "center center", of: myClickEvent, collision: "fit", within: "body"},
		buttons: { 
			OK: function() {
				var newRowName = $("#renamedRowName").val();
				for (var currentTask = 1; currentTask<lines.length; currentTask++) {
					var currentRow = lines[currentTask][col_row]
					if (currentRow) {
						if (currentRow.toUpperCase()==rowName) lines[currentTask][col_row]=newRowName;
					}
				}
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
				$("#renameRowDialog").dialog("close");
			},
			Cancel: function () {
				$("#renameRowDialog").dialog("close");
			}
		}
    };
	$("#renameRowDialog").dialog(opt).dialog("open");
	$("#renamedRowName").focus();
	
}

// INPUT FUNCTIONS

function makeDateIncremented(numHours) {
	today = new Date();
	today = new Date(today.getTime()+numHours*one_hour);
	$("#todays-date").val(makeDateStr(today)+","+makeTimeStrFromDate(today));
	drawOutput(lines);
	$(".date-button").removeClass("active")
	$("#today-button").addClass("active");
}

function checkTime() {
	now = new Date();
	if (now.getTime()-today.getTime()>60000) {
		today=new Date();
		makeDateIncremented(0)
	}
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

// TASK FUNCTIONS

function clickFinish() {
	if (lines[currentTask][col_complete]=="Yes") uncompleteTask();
	else completeTask();
}

function completeTask(wasDropped) {

	$("#deleteDialog").dialog("close");

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
	$("#show-finished-toggle").show();	
	
}

function uncompleteTask() {

	$("#deleteDialog").dialog("close");
	
	var opt = {
        autoOpen: false,
        modal: true,
        width: 350,
        height:350,
        title: 'Un-Finish Task',
		position: {my: "center center", at: "center center", of: "#taskBlock"+currentTask, collision: "fit", within: "body"},
		buttons: { 
			Yes: function() {
				lines[currentTask][10]="";
				$("#uncompleteDialog").dialog("close");
				$("#editDialog").dialog("close");
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
				$("#show-finished-toggle").show();
			},
			No: function () {
				$("#uncompleteDialog").dialog("close");
				$("#finish-area").removeClass("hover-finish");
				$("#finish-area").addClass("normal-finish");
				$("#finish-instructions").hide();
				$("#show-finished-toggle").show();
			}
		},
		open: function() { $("#completeDialog").find('button:nth-child(0)').focus(); }
    };
	var taskName = lines[currentTask][1];
	$("#uncompleteTaskName").text(taskName);
	$("#uncompleteDialog").dialog(opt).dialog("open");
}

function deleteTask() {

	$("#completeDialog").dialog("close");
	$("#finish-area").removeClass("hover-finish");
	$("#finish-area").addClass("normal-finish");
	$("#finish-instructions").hide();
	$("#show-finished-toggle").show();
	
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

function deleteAllFinished() {
	var opt = {
        autoOpen: false,
        modal: true,
        width: 300,
        height:200,
        title: 'Delete All Finished',
		position: {my: "center center", at: "center center", of: "body", collision: "fit", within: "body"},
		buttons: { 
			Yes: function() {
				var toDelete = []
				for (var currentTask = 0;currentTask<lines.length;currentTask++) {
					if (lines[currentTask][col_complete]=="Yes") {
						lines.splice(currentTask,1);
						currentTask--;
					}
				}
				$("#deleteFinishedDialog").dialog("close");
				isSaved = 0;
				$("#unsaved-changes").show();
				saveFileCookie();
				drawOutput(lines);
			},
			No: function () {
				$("#deleteFinishedDialog").dialog("close");
			}
		},
		open: function() { $("#deleteFinishedDialog").find('button:nth-child(1)').focus(); }
    };
	
	var finishedCount = 0;
	for (var currentTask = 0;currentTask<lines.length;currentTask++) {
		if (lines[currentTask][col_complete]=="Yes") finishedCount++
	}
	$("#deleteFinishedCount").text(finishedCount);
	$("#deleteFinishedDialog").dialog(opt).dialog("open");	
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


function delayTask(numHours) {

	if (lines[currentTask][col_increment]>0 && lines[currentTask][col_startday]>0) {
		newTaskCopy()
		lines[currentTask][col_increment]="";
	}

	var sameTime = isTaskSameTime(currentTask)
	var dueDate = getDueDate(currentTask)
	
	var due_mseconds = 0
	if (lines[currentTask][col_duetime]) {
		var timeParts = lines[currentTask][col_duetime].split(":")
		due_mseconds = (timeParts[0]*60*60+timeParts[1]*60)*1000;
	}
	
	var newDueDate = new Date(dueDate.getTime() + due_mseconds + one_hour*numHours)

	lines[currentTask][col_dueday] = newDueDate.getDate();
	lines[currentTask][col_duemonth] = newDueDate.getMonth()+1;
	if (newDueDate.getYear()==today.getYear()) lines[currentTask][col_dueyear]="";
	else lines[currentTask][col_dueyear] = newDueDate.getYear()+1900;

	if (sameTime==1) {
		lines[currentTask][col_startday] = lines[currentTask][col_dueday]
		lines[currentTask][col_startmonth] = lines[currentTask][col_duemonth]
		lines[currentTask][col_startyear] = lines[currentTask][col_dueyear]
	}
	
	if (lines[currentTask][col_duetime]) {
		var myMinutes = newDueDate.getMinutes();
		if (myMinutes<10) myMinutes = "0"+myMinutes.toString();
		lines[currentTask][col_duetime] = newDueDate.getHours()+":"+myMinutes;
		if (sameTime==1) lines[currentTask][col_starttime] = lines[currentTask][col_duetime]
	}
	
	drawOutput(lines);
	isSaved = 0;
	$("#unsaved-changes").show();
	saveFileCookie();
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
		$("#show-finished-toggle").hide();
	}
}
function unhighlightFinish(ev) {
    ev.preventDefault();
	$("#finish-area").removeClass("hover-finish");
	$("#finish-area").addClass("normal-finish");
	$("#finish-instructions").hide();
	$("#show-finished-toggle").show();
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

function newRowMenu() {
	$("#newRowName").val("");
	var opt = {
        autoOpen: false,
        modal: true,
        width: 300,
        height:200,
        title: 'Move Task to New Group',
		position: {my: "center center", at: "center center", of: myClickEvent, collision: "fit", within: "body"},
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
		var line = [ "TaskNum" , "Task" ,"Start-Month","Start-Day","Start-Year","Due-Month","Due-Day","Due-Year","Color","Row","Complete?","Interval","Start-Time","Due-Time"];
		lines = [line];
		//newTask("","Misc Task");
		//newTask("Group","Grouped Task");
		drawOutput(lines);
		var myMonth = today.getMonth()+1;
		if (myMonth.toString().length==1) myMonth = "0"+myMonth
		var myYear = today.getYear()+1900;
		currentFileName = "newTaskFile" + "_" + myMonth + today.getDate() + myYear + ".csv";
		$(".fileinput-filename").html(currentFileName);
		createCookie("fileName",currentFileName);
		$("span.fileinput-new").hide();
		$(".savefile-button").show();
		$("#chosen-file-label").show()
		$(".instructions").hide();
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
		
	if (startDate) {

		var new_startdate = new Date(startDate.getTime() + newTask[col_increment]*one_day);
		newTask[col_startmonth] = new_startdate.getMonth()+1;
		newTask[col_startday] = new_startdate.getDate();
		newTask[col_startyear] = new_startdate.getYear()+1900;
		
		if(dueDate) {
			var start_offset = dueDate.getTime() - startDate.getTime();
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
	
	$("#middle-buttons").show();
	
	var newTask = ["","","","","","","","","","","","","",""];
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
		currentTask = lines.length-1
		var myTaskID = lines.length-1
		if (editDebug) console.log("opening new task "+myTaskID+" for editing")
		$("#taskBlock"+myTaskID).click();
		$("#namepicker").focus();
	}
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

function makeTestDatesDisplayable() {
	for (var i=0; i< lines.length; i++) {
		if (lines[i][col_startday]>0) { 
			var startDate = getStartDate(i)
			if (isTestFile) {
				startDate = new Date(startDate.getTime()+testFileDateDiff*one_day)
				lines[i][col_startday]=startDate.getDate()
				lines[i][col_startmonth]=startDate.getMonth()+1
				lines[i][col_startyear]=startDate.getYear()+1900
			}
		}
		if (lines[i][col_dueday]>0) {
			var dueDate = getDueDate(i)
			if (isTestFile) {
				dueDate = new Date(dueDate.getTime()+testFileDateDiff*one_day)
				lines[i][col_dueday]=dueDate.getDate()
				lines[i][col_duemonth]=dueDate.getMonth()+1
				lines[i][col_dueyear]=dueDate.getYear()+1900
			}
		}   
	}
}

function makeTestDatesSavable() {
	for (var i=0; i< lines.length; i++) {
		if (lines[i][col_startday]>0) { 
			var startDate = getStartDate(i)
			if (isTestFile) {
				startDate = new Date(startDate.getTime()-testFileDateDiff*one_day)
				lines[i][col_startday]=startDate.getDate()
				lines[i][col_startmonth]=startDate.getMonth()+1
				lines[i][col_startyear]=startDate.getYear()+1900
			}
		}
		if (lines[i][col_dueday]>0) {
			var dueDate = getDueDate(i)
			if (isTestFile) {
				dueDate = new Date(dueDate.getTime()-testFileDateDiff*one_day)
				lines[i][col_dueday]=dueDate.getDate()
				lines[i][col_duemonth]=dueDate.getMonth()+1
				lines[i][col_dueyear]=dueDate.getYear()+1900
			}
		}   
	}
}

// SORTING FUNCTIONS

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

  
