
var myClickEvent;

var sortDebug = 0;
var editDebug = 0;

var lines = [];
var showFinished = 0;

var shape = "";
var inRightClickMode = 0;
var dateSliderActive = 0;

var today = new Date();
var one_day=1000*60*60*24;
var one_hour=1000*60*60;

var currentFileName = "newTaskFile.csv";
var isSaved = 1;
var currentTask = 0;
var currentTaskDateSync = 0;
var currentRowName = "";
var lastTaskID = 0;
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

var simulateMobile = 0;

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
                /*"Snooze 1 Day": {
					name: "Snooze 1 day", icon: "fa-bell-slash-o",
					callback: function(key, options) {	delayTask(24);	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_complete] == "Yes") return false;
						if (lines[currentTask][col_duetime]!==null && lines[currentTask][col_duetime]!=="") return false;
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
									if (time_until_start>0) return false;
									else return true;
								}
							}
						}
						return false;
					}
				},
                "SnoozeHour": {
					name: "Snooze 1 hour", icon: "fa-bell-slash-o",
					callback: function(key, options) {	delayTask(1);	},
			        visible: function(key, opt){        
						if (lines[currentTask][col_complete] == "Yes") return false;
						if (lines[currentTask][col_duetime] == null || lines[currentTask][col_duetime] == "") return false;
						if (lines[currentTask][col_dueday] == null || lines[currentTask][col_dueday] == "") return false;
						var dueDate = getDueDate(currentTask);
						var days_until_due = getDateDifference(today,dueDate)
						if (days_until_due<0 || days_until_due==0 ) {
							if (lines[currentTask][col_startday] == null || lines[currentTask][col_startday] == "") return true;
							else {
								var startDate = getStartDate(currentTask)
								var days_until_start = getDateDifference(today,startDate)
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
				},*/
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

function editDialogKeypress(e) {
	if (e.which==13) {
		e.preventDefault();
		updateTask(currentTask);
		makingNewTask = 0;
		$("#editDialog").dialog("close");
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
	$(".interval-button").removeClass("active")
	$("#interval-button"+intVal).addClass("active")
}

// EDIT TASK FUNCTIONS

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




// MAIN BUILD FUNCTION

function drawOutput(lines){
	if (typeof lines[0] =="undefined") {return;}

	var rowWithMeta = [[],"MISC",[]]
	var tableRows = [rowWithMeta];
	
	$("#delete-finished-button").attr("disabled",true)
	var showBodyInstructions = 0;
	if (lines.length>1) showBodyInstructions = 1
	
	for (var currentTask = 1; currentTask < lines.length; currentTask++) {
		
		if (editDebug) console.log(lines[currentTask])
		var taskNum = parseInt(lines[currentTask][col_ID]);
		if (isNaN(taskNum)) { continue; }
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
	if (showBodyInstructions==1) {
		var bodyInstructions = document.createElement("div")
		bodyInstructions.setAttribute("id","body-instructions")
		bodyInstructions.setAttribute("style","font-size:2em;width:100%;text-align:center;margin-top:1em;")
		bodyInstructions.innerHTML = "Drag tasks out here to put them into a group"
		document.getElementById("output").appendChild(bodyInstructions);
	}
	document.getElementById("output").style =	"font-size:"+$( "#font-size" ).val()+"px;"

	if (lines.length==1) {
		$("#myBody").addClass("body-with-help")
		$("#misc-block").addClass("misc-with-help")
	}

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
	var name = document.createElement("div");
	name.className = "task-name"
	name.innerHTML = "<b>"+myName+"</b>";
	taskBlock.appendChild(name)

	if (lines[currentTask][col_increment].length>0) taskBlock.appendChild(createRepeatIcon(currentTask,(isPastTask||isComplete)))
	
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
					if (time_until_start<(60*60*1000)) taskBlock.className += " now-task"
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
					if (time_until_start<(60*60*1000)) taskBlock.className += " now-task"
					else taskBlock.className += " later-task"
				}
				else {
					startDatePhrase.innerHTML = "<b>Started TODAY</b>";
					taskBlock.className += " now-task";
				}
			}
		}
		else {
			if (sameTime==0) {
				startDatePhrase.innerHTML = "<b>Starts TODAY</b>";
				taskBlock.className += " now-task";
			}
			else startDatePhrase.innerHTML = "";
		}							
		taskBlock.className += " now-task";
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
		if (sameTime) dueDatePhrase.innerHTML = dueDateStr+", "+dueTimeStr+" ("+(-days_until_due)+" passed)";
		else dueDatePhrase.innerHTML = "Due: "+dueDateStr+" ("+(-days_until_due)+" passed)";
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
	createCookie("myCSVFile",csvContent);
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
	var fullPath = document.getElementById('csvFileInput').value;
	if (!fileName) {
		var fileName = fullPath.split("\\");
		currentFileName = fileName[fileName.length-1];
		createCookie("fileName",currentFileName);
	}
	if (currentFileName.indexOf("leventest")>-1) {
		var fileCreationDate = new Date(2017,4,1)
		var actualStartOfToday = new Date()
		actualStartOfToday.setHours(0,0,0,0);
		testFileDateDiff = getDateDifference(fileCreationDate,actualStartOfToday)
		isTestFile=1;
	}
	
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
	
	if (isTestFile) makeTestDatesDisplayable();

	$(".savefile-button").show()
	$("#chosen-file-label").show()
	$(".instructions").hide();
	$("#middle-buttons").show();
	$("#right-buttons").show();
	drawOutput(lines);
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


function saveFile() {

	if (isTestFile) makeTestDatesSavable();

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
	
	if (isTestFile) makeTestDatesDisplayable();
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
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

  
