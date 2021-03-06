
var myClickEvent;

var sortDebug = 0;
var editDebug = 0;
var fileDebug = 0;
var simulateMobile = 0;

var lines = [];

var shape = "";
var inRightClickMode = 0;
var dateSliderActive = 0;

var today = new Date();
var one_day=1000*60*60*24;
var one_hour=1000*60*60;

var currentFileName = "";
var showFinished = 0;
var isSaved = 1
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

var myDropboxData;

var myURL = window.location.href
if (myURL.indexOf("taskboard.leventech.net")!==-1) document.title = "Test Task Board"
else if (myURL.indexOf("file:///")!==-1) document.title = "Local Task Board"
  
document.onselectstart = function() { return false; };
$(document).ready(function() {

	initPageLinks();
	initToolbar();
	initTaskEditor();
	
	initTaskboardUI();
	initRemoteStorage();


	setInterval(checkTime,60000)

});  //End of Doc.Ready





// fngroup: INIT FUNCTIONS

function initTaskboardUI() {
	initDialogs();
	initDialogKeys();

	$.contextMenu( 'destroy' );
	initRowContextMenu()
	initTaskContextMenu("right")

	if (isMobile()) { initRightClickMode() }
	
	//$.ui.dialog.prototype._focusTabbable = function(){};
	
	$(document).on('mousedown', '.task-block', function (e){ myClickEvent = e; return true; });
	$(document).on('mousedown', '.task-row', function (e){ myClickEvent = e; return true; });
}

function initDialogs() {
	initSaveDialog()
	initDeleteAllDialog()
	initDeleteTaskDialog()
	initUncompleteDialog()
	initNewFileDialog()
	initNewRowDialog()
	initRenameRowDialog()
	initDeleteFileDialog()
	initRenameFileDialog()


	var opt = { autoOpen: false	};
	$(".my-dialog").dialog(opt).dialog("close");
	$(".my-dialog").show();	
}


function initSaveDialog() {
	var saveDialog = document.createElement("div")
	saveDialog.id="saveDialog"
	saveDialog.className = "my-dialog"
	saveDialog.innerHTML = "This file has not been saved, and you're about to lose your changes.<br/><br/>Save your changes now?"
	document.getElementById("myBody").append(saveDialog)
}



function initDialogKeys() {
	
	initFileDialogKeys();
	
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
		var key = e.which;
		if ($('#completeDialog').is(':visible')) {
			if (key == 13) {
				lines[currentTask][10]="Yes";
				if (lines[currentTask][11].length>0) newTaskCopy();
				$("#completeDialog").dialog("close");
				$("#editDialog").dialog("close");
				changeToUnsaved();
				drawOutput(lines);
				makeFinishUnhighlighted();
			}
			else if (key == 27) {
				$("#completeDialog").dialog("close");
				makeFinishUnhighlighted();
			}
		}
		if ($('#deleteDialog').is(':visible')) {
			if (key == 13) {
				lines.splice(currentTask,1);
				$("#deleteDialog").dialog("close");
				$("#editDialog").dialog("close");
				changeToUnsaved();
				drawOutput(lines);
			}
			else if (key == 27) {
				$("#deleteDialog").dialog("close");
			}
		}
		checkPageLinkDialogs(key);
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
			initTaskContextMenu("left")
		}
		else {
			inRightClickMode = 0
			$("#right-click-mode-indicator").hide();
			initTaskContextMenu("right")
		}
	})
}

function snoozeVisible() {
	return (lines[currentTask][col_duetime] !== null && lines[currentTask][col_duetime] !== "");
}

function initTaskContextMenu(button) {
	var myOptions = {
            selector: '.task-block', 
			className: 'my-context-menu',
			events: {
				hide: function(opt) {
					if (isMobile()) {
						inRightClickMode = 0;
						$("#right-click-mode-indicator").hide();
						initTaskContextMenu("right")
					}
				}
			},
			items: {
                "SnoozeMenu": {
					name: "Snooze", icon: "fa-bell-slash-o",
					items: {
						"snooze-key1": 	{"name":"1 hour",	callback: function(key, options) {	delayTask(1);	}, visible: snoozeVisible},
						"snooze-key2": 	{"name":"2 hours",	callback: function(key, options) {	delayTask(2);	}, visible: snoozeVisible},
						"snooze-key4": 	{"name":"4 hours",	callback: function(key, options) {	delayTask(4);	}, visible: snoozeVisible},
						"snooze-key12": {"name":"12 hours",	callback: function(key, options) {	delayTask(12);	}, visible: snoozeVisible},
						"snooze-key1d": {"name":"1 day", 	callback: function(key, options) {	delayTask(24);	}},
						"snooze-key2d": {"name":"2 days",	callback: function(key, options) {	delayTask(48);	}},
						"snooze-key3d": {"name":"3 days",	callback: function(key, options) {	delayTask(72);	}},
						"snooze-key1w": {"name":"1 week",	callback: function(key, options) {	delayTask(168);	}},
					},
			        visible: function(key, opt){        
						if (!opt.$trigger) return false;
						if (hasClass(opt.$trigger,"due-task")) return true;
						return false;
					}
				},
                "Finish": {
					name: "Finish", icon: "fa-check-square-o",
					callback: function(key, options) {	completeTask();	},
			        visible: function(key, opt){        
						if (!opt.$trigger) return false;
						if (hasClass(opt.$trigger,"now-task")) return true;
						if (hasClass(opt.$trigger,"past-task")) return true;
						return false;
					}
				},
                "Un-Finish": {
					name: "Un-Finish", icon: "fa-check-square-o",
					callback: uncompleteTask,
			        visible: function(key, opt) { return (lines[currentTask][col_complete] == "Yes") }					
				},				
                "Edit": {
					name: "Edit", icon: "fa-edit",
					callback: editTaskContextMenu,
				},
                "Put in Group": {
					name: "Put in Group", icon: "fa-folder-o",
					callback: newRowMenu,
			        visible: function(key, opt) { return (lines[currentTask][col_row] == "") }					
				},				
                "Change Group": {
					name: "Change Group", icon: "fa-folder-o",
					callback: newRowMenu,
			        visible: function(key, opt) { return (lines[currentTask][col_row] !== "") }
				},				
                "Delete": {
					name: "Delete", icon: "fa-trash",
					callback: deleteTask,
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
						initTaskContextMenu("right")
					}
				}
			},
			items: {
                "New Task Here": {
					name: "New Task Here", icon: "fa-clone",
					callback: function(key, options) {	newTask(options.$trigger.attr("data-rowname"),"",1);	},
			        visible: function(key, opt){        
						return true;
					}
				},
                "Rename Group": {
					name: "Rename Group", icon: "fa-edit",
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

// fngroup:  SAVE DIALOG FUNCTION

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

function showBeforeConnectDialog() {
	var opt = {
        autoOpen: false,
        modal: true,
        width: 305,
        height:300,
        title: 'Save File?',
		position: {my: "center center", at: "center center", of: window},
		buttons: { 
			Save: function() {
				saveFile();
				$("#saveDialog").dialog(opt).dialog("close");
				connectToRemote()
				loadRemoteStorage();
			},
			Upload: function () {
				$("#saveDialog").dialog(opt).dialog("close");
				connectToRemote()
				saveFileCookie();
				loadRemoteStorage();
			},
			Neither: function () {
				$("#saveDialog").dialog(opt).dialog("close");
				connectToRemote()
				isSaved = 1;
				createCookie("isSaved",1)
				loadRemoteStorage();
			}			
		}
    };
	$("#saveDialog").dialog(opt).dialog("open");
}

function connectToRemote() {
	createCookie("remoteConnected",1)
	$("#filename-selector").show();
	$(".fileinput-filename").hide();
	$("#connected-to-remote").show();
	$("#unsaved-changes").hide();
	$("#filename-selector").on("change",function() {
		currentFileName = $("#filename-selector").val();
		if (currentFileName == "") {
			var output = document.getElementById("output")
			lines = ""
			output.innerHTML = ""
			eraseCookie("fileName")
		}
		else {
			remoteStorage.taskboards.load();
			createCookie("fileName",currentFileName)
		}
	});
}


function changeToUnsaved() {
	isSaved = 0;
	if (!remoteStorage.connected) $("#unsaved-changes").show();
	saveFileCookie();
}

// fngroup:  TASK OPERATION FUNCTIONS

function clickFinish() {
	if (lines[currentTask][col_complete]=="Yes") uncompleteTask();
	else completeTask();
}

function completeTask(wasDropped) {
	if (!lines[currentTask]) return;
	$("#deleteDialog").dialog("close");

	lines[currentTask][col_complete]="Yes";
	if (lines[currentTask][col_increment].length>0) newTaskCopy();
	$("#completeDialog").dialog("close");
	$("#editDialog").dialog("close");
	makeFinishUnhighlighted();
	changeToUnsaved();
	drawOutput(lines);
}

function initUncompleteDialog() {
	var uncompleteDialog = document.createElement("div")
	uncompleteDialog.id="uncompleteDialog"
	uncompleteDialog.className = "my-dialog"
	uncompleteDialog.innerHTML = "Are you sure you want to UN-finish the task '<span id='uncompleteTaskName' ></span>'?<br/><br/>This will add the task back to your board.<br/><br/>"
	document.getElementById("myBody").append(uncompleteDialog)
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
				changeToUnsaved();
				drawOutput(lines);
				makeFinishUnhighlighted();
			},
			No: function () {
				$("#uncompleteDialog").dialog("close");
				makeFinishUnhighlighted();
			}
		},
		open: function() { $("#completeDialog").find('button:nth-child(0)').focus(); }
    };
	var taskName = lines[currentTask][1];
	$("#uncompleteTaskName").text(taskName);
	$("#uncompleteDialog").dialog(opt).dialog("open");
}

function initDeleteTaskDialog() {
	var deleteTaskDialog = document.createElement("div")
	deleteTaskDialog.id="deleteDialog"
	deleteTaskDialog.className = "my-dialog"
	deleteTaskDialog.innerHTML = "	Are you sure you want to DELETE the task '<span id='deleteTaskName' ></span>'?<br/><br/>\
									This will remove all trace of this task, from the board and your save file.<br/><br/> \
									To keep a record of the task, but remove it from the board, you can \
									<button type='button' class='btn btn-default' style='padding:5px;padding-top:1px;padding-bottom:1px;margin-left:5px;margin:0px;margin-right:5px;font-size:12px;' onclick='completeTask();'>\
									<i class='fa fa-check-square-o' aria-hidden='true' style='margin-right:5px;'></i>Finish</button>\
									it."
	document.getElementById("myBody").append(deleteTaskDialog)
}

function deleteTask() {

	$("#completeDialog").dialog("close");
	makeFinishUnhighlighted();
	
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
				changeToUnsaved();
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


function initDeleteAllDialog() {
	var deleteAllDialog = document.createElement("div")
	deleteAllDialog.id="deleteFinishedDialog"
	deleteAllDialog.className = "my-dialog"
	deleteAllDialog.innerHTML = "Are you sure you want to delete all <b id='deleteFinishedCount'></b> finished tasks?<br/><br/>"
	document.getElementById("myBody").append(deleteAllDialog)
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
				changeToUnsaved();
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
	changeToUnsaved();
}

function initRenameRowDialog() {
	var renameRowDialog = document.createElement("div")
	renameRowDialog.id="renameRowDialog"
	renameRowDialog.className = "my-dialog"
	renameRowDialog.innerHTML = "Give the '<span id='current-row-name'></span>' group a new name:<input id='renamedRowName' width='50px' style='margin-top:10px;'></input>"
	document.getElementById("myBody").append(renameRowDialog)
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
				changeToUnsaved();
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


// fngroup:  DRAG AND DROP FUNCTIONS

function highlightRow(ev) {
    ev.preventDefault();
	dragcounter++;
	if (ev.target.className.substr(0,8)=="task-row") {
		$(".task-row").removeClass("hover-row")
		$(".task-row").addClass("normal-row")
		$(".misc-block").removeClass("hover-row")
		$(".misc-block").addClass("normal-row")
		var toHighlight = 1;
		if (draggingNew==0) {
			if (currentTask) {
				if (ev.target.getAttribute("data-rowname")==lines[currentTask][col_row].toUpperCase()) {
					toHighlight = 0;
					currentRowName = ev.target.getAttribute("data-rowname")
				}
			}
			else { toHighlight = 0; }
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
	if (draggingNew == 0) {
		if (currentTask) {
			if (lines[currentTask][col_row]=="") toHighlight=0;
		}
		else { toHighlight = 0; }
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
		makeFinishHighlighted();
	}
}
function makeFinishHighlighted() {
	$("#finish-area").removeClass("normal-finish");
	$("#finish-area").addClass("hover-finish");
	$("#finish-instructions").show();
	$("#show-finished-toggle").hide();
}

function unhighlightFinish(ev) {
    ev.preventDefault();
	makeFinishUnhighlighted();
}
function makeFinishUnhighlighted() {
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
	}
    else {
		var taskID = ev.dataTransfer.getData("text");
		if (taskID>0) {
			if (lines[taskID][col_row].toUpperCase()!==newRowName.toUpperCase()) {
				lines[taskID][col_row]=newRowName;
				changeToUnsaved();
				drawOutput(lines);
			}
		}
		currentTask = ""
	}
	draggingNew = 0;
}

function dropFinish(ev) {
    ev.preventDefault();
    var taskID = ev.dataTransfer.getData("text");
	currentTask = taskID;
	completeTask(1);
	ev.stopPropagation();
}


// fngroup: CREATION FUNCTIONS





function initNewRowDialog() {
	var newRowDialog = document.createElement("div")
	newRowDialog.id="newRowDialog"
	newRowDialog.className = "my-dialog"
	newRowDialog.innerHTML = "Name the new group:<input id='newRowName' width='50px' style='margin-top:10px;'></input>"
	document.getElementById("myBody").append(newRowDialog)
}
	
function newRow(ev) {
    ev.preventDefault();
	if (currentTask<1 || draggingNew==1) {
		draggingNew = 0;
		return;
	}
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
				changeToUnsaved();
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
				changeToUnsaved();
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




function newTaskCopy() {
	var newTask = lines[currentTask].slice();
	lastTaskID = lastTaskID+1;
	newTask[col_ID] = lastTaskID;
	newTask[col_complete] = "";

	var startDate = getStartDate(currentTask)
	var dueDate = getDueDate(currentTask)
		
	if (startDate) {

		
		if(dueDate) {
			var new_startdate = new Date(startDate.getTime() + newTask[col_increment]*one_day);
			var start_offset = dueDate.getTime() - startDate.getTime();
			var new_duedate = new Date(new_startdate.getTime() + start_offset);
			newTask[col_duemonth] = new_duedate.getMonth()+1;
			newTask[col_dueday] = new_duedate.getDate();
			newTask[col_dueyear] = new_duedate.getYear()+1900;
		}
		else {
			var new_startdate = new Date(today.getTime() + newTask[col_increment]*one_day);
		}

		newTask[col_startmonth] = new_startdate.getMonth()+1;
		newTask[col_startday] = new_startdate.getDate();
		newTask[col_startyear] = new_startdate.getYear()+1900;
	}
	else if (dueDate) {
		var new_duedate = new Date(today.getTime() + newTask[col_increment]*one_day);
		newTask[col_duemonth] = new_duedate.getMonth()+1;
		newTask[col_dueday] = new_duedate.getDate();
		newTask[col_dueyear] = new_duedate.getYear()+1900;
	}

	lines.push(newTask);
	drawOutput(lines);
	changeToUnsaved();
}

function newTask(rowName,taskName,openMe) {
	
	$(".other-buttons").show();
	
	var newTask = ["","","","","","","","","","","","","",""];
	lastTaskID = lastTaskID+1;
	if (editDebug) console.log("making task "+lines.length+" (taskNum="+lastTaskID);
	newTask[col_ID] = lastTaskID;
	newTask[col_task] = taskName;
	newTask[col_row] = rowName;
	lines.push(newTask);
	drawOutput(lines);
	if (openMe==1) {
		makingNewTask = 1;
		currentTask = lines.length-1
		var myTaskID = lines.length-1
		if (editDebug) console.log("opening new task "+myTaskID+" for editing")
		$("#taskBlock"+myTaskID).click();
		$("#namepicker").focus();
	}
	else saveFileCookie();
}


