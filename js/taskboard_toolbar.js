


function checkWidth() {
	if (isMobile()) return;

	width = $(this).width();
	if (width<1400) initToolSelector();
	else reverseToolSelector();
}

function initToolbar() {

	$(window).scroll(function(){
		if ($(window).scrollTop() > 45) {
			$("#taskboard-toolbar").removeClass("moving-toolbar");
			$("#taskboard-toolbar").addClass("stuck-toolbar");
		}
		else {
			$("#taskboard-toolbar").removeClass("stuck-toolbar");
			$("#taskboard-toolbar").addClass("moving-toolbar");
		}
	});	

	generateToolbar();

	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})
	
	initShapePicker();
	initFontSlider();
	initDateSlider();

	var showFinishedCookie = readCookie("showFinished")
	if (showFinishedCookie==1) toggleFinishedVisible()
	
	if (isMobile()) { initToolSelector() }
	else {
		$(window).on('resize', checkWidth);
		checkWidth()
	}
}

function generateToolbar() {	
	var myToolbar = document.createElement("div")
	myToolbar.id = "taskboard-toolbar"
	myToolbar.className = "moving-toolbar"
	myToolbar.appendChild(createToolSelector())
	myToolbar.appendChild(initLeftButtons())
	myToolbar.appendChild(initLeftMiddleButtons())
	myToolbar.appendChild(initRightMiddleButtons())
	myToolbar.appendChild(initRightButtons())
	document.getElementById("myBody").append(myToolbar)
}

function getRemoteStorageIcon() {
	return "<img class='remotestorage-icon rs-cube rs-action' src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzIiIHdpZHRoPSIzMiIgdmVyc2lvbj0iMS4xIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KIDxkZWZzPgogIDxyYWRpYWxHcmFkaWVudCBpZD0iYSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGN5PSI1NzEuNDIiIGN4PSIxMDQ2LjUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjE0NDMzIDAgMCAuMTY2NjcgMTIwMS41IDg3Ny4xMSkiIHI9Ijk2Ij4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmNGEwNCIgc3RvcC1vcGFjaXR5PSIuNzYxNTQiIG9mZnNldD0iMCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY0YTA0IiBvZmZzZXQ9IjEiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogPC9kZWZzPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzMzYuNiAtOTU2LjM1KSI+CiAgPHBhdGggc3R5bGU9ImNvbG9yOiMwMDAwMDAiIGQ9Im0xMzUyLjYgOTU2LjM1IDAuMjg4NiAxNS4xMzYgMTMuNTY3LTcuMTM1Mi0xMy44NTUtOC4wMDExemwtMTMuODU1IDguMDAxMSAxMy41NjcgNy4xMzUyIDAuMjg4Ny0xNS4xMzZ6bS0xMy44NTUgOC4wMDExdjE1Ljk5OGwxMi45NTgtNy44MTYyLTEyLjk1OC04LjE4MTV6bTAgMTUuOTk4IDEzLjg1NSA4LjAwMTEtMC42MDg5LTE1LjMxNy0xMy4yNDYgNy4zMTU2em0xMy44NTUgOC4wMDExIDEzLjg1NS04LjAwMTEtMTMuMjUxLTcuMzE1Ni0wLjYwNDQgMTUuMzE3em0xMy44NTUtOC4wMDExdi0xNS45OThsLTEyLjk2MiA4LjE4MTUgMTIuOTYyIDcuODE2MnoiIGZpbGw9InVybCgjYSkiLz4KIDwvZz4KPC9zdmc+Cg=='>"
}

function createToolSelector() {
	var toolSelector = document.createElement("div")
	toolSelector.id = "tool-select-control"
	toolSelector.style = "width:100%;float:left;display:none;padding-left:1em;padding-right:1em;"
	toolSelector.innerHTML += "\
				<div style='display:inline-block;margin-right:20px;position:relative;top:-0.5em;'>\
					<b style='font-size:24px;'>Control:</b><br/>\
					<select id='tool-selector' class='btn btn-default dropdown tool-selector' style='font-size:24px;height:2.5em;'>\
						<option value='new-open-file'>New File / Open File</option>\
						<option value='draggables'>New Task / Finish Task</option>\
						<option value='size-shape'>Task Shape / Task Size</option>\
						<option value='future-peek'>Future Peek</option>\
					</select>\
				</div>"
	return toolSelector;
}

function initLeftButtons() {
	var leftButtons = document.createElement("div")
	leftButtons.id = "left-buttons"
	leftButtons.innerHTML += "\
			<div class='toolbar-selection' id='new-open-file' style='margin:10px;padding:10px;background:#F0F0F0;margin-left:15px;user-select:none;display:inline-block;'>\
				<div id='open-local-file' class='fileinput fileinput-new' data-provides='fileinput' style='width:400px;margin-left:0px;margin-bottom:0px;'>\
					<div id='chosen-file-label' style='margin-top:0px;margin-left:10px;'>\
						<div id='taskboard-remote-storage' style='width:100%;height:40px;text-align:left;padding-top:7px;position:relative;'>\
							<span id='connected-to-remote' style='display:none;'>Connected to Remote Storage</span>\
							<span id='not-connected-to-remote' style='display:none;'>Working Locally</span>\
						</div>\
						<strong>Current File:</strong>\
						<input type='file' id='csvFileInput' style='display:none;' onchange='handleFiles(this.files)' onclick='this.value=null;' accept='.csv'/ hidden>\
						<div style='display:inline-block;width:10em;'>\
							<span class='fileinput-filename'></span>\
							<span id='filename-display' class='fileinput-new'>No File</span>\
							<span id='unsaved-changes' style='display:none;'>\
								<span class='tooltiptext'>Unsaved Changes</span>\
								<i class='fa fa-exclamation-triangle' aria-hidden='true'></i>\
							</span>\
							<select id='filename-selector' class='btn btn-default file-button' style='display:none;width:10em;'></select>\
						</div>\
						<div class='btn-group' role='group'>\
							<button id='newfile-button' class='btn btn-default file-button newfile-button' onclick='newFile()'>\
								<span class='tooltiptext'>New</span>\
								<i class='fa fa-clone' aria-hidden='true' style=''></i><span id='newfile-button-label'></span>\
							</button>\
							<button id='openfile-button' class='openfile-button btn btn-default file-button' onclick='document.getElementById(\"csvFileInput\").click(); $(\"#openfile-button\").blur();' style=''>\
								<span id='openfile-button-label'>\
									<span id='openfile-button-name'>\
										<span class='tooltiptext'>Open</span>\
										<i class='fa fa-folder-o' aria-hidden='true' style=''></i>\
									</span>\
									<span id='importfile-button-name' style='display:none;'>\
										<span class='tooltiptext'>Upload</span>\
										<i class='fa fa-cloud-upload' aria-hidden='true' style=''></i>\
									</span>\
								</span>\
							</button>\
							<button id='renamefile-button' class='btn btn-default file-button remote-file-button' onclick='renameFile()' style='display:none;z-index:2;'>\
								<span class='tooltiptext'>Rename</span>\
								<i class='fa fa-edit' aria-hidden='true' style=''></i><span id='renamefile-button-label'></span>\
							</button>\
							<button id='deletefile-button' class='btn btn-default file-button remote-file-button' onclick='deleteFile()' style='display:none;z-index:2;'>\
								<span class='tooltiptext'>Delete</span>\
								<i class='fa fa-trash' aria-hidden='true' style=''></i><span id='deletefile-button-label'></span>\
							</button>\
							<button id='exportfile-button' class='btn btn-default file-button' onclick='saveFile()' style='z-index:2;'>\
								<span class='tooltiptext'>Download</span>\
								<i class='fa fa-download' aria-hidden='true' style=''></i><span id='renamefile-button-label'></span>\
							</button>\
						</div>\
					</div>\
				</div>\
				<span id='result'></span>\
			</div>"
			return leftButtons;
}

function initLeftMiddleButtons() {
	var middleButtons = document.createElement("div")
	middleButtons.id = "left-middle-buttons"
	middleButtons.className = "other-buttons"
	middleButtons.style = "diplay:none;user-select:none;width:400px;"
	middleButtons.innerHTML += "\
				<div class='toolbar-selection' id='size-shape' style='text-align:center;display:inline-block;\'>\
					<div class='middle-button' style='margin-top:20px;'>\
						<label for='task-shape'>Shape</label><br/>\
						<div class='btn-group' role='group' style='height:2em;'>\
							<button type='button' class='btn btn-default shape-button' id='shape-button-default' onclick='makeShapeDefault()' style='height:4em;'>\
								<div style='height:1.2em;width:1.6em;background-color:black;border:2px solid black;margin-left:0.4em;margin-right:0.4em;'></div>\
							</button>\
							<button type='button' class='btn btn-default shape-button' id='shape-button-wide' onclick='makeShapeWide()' style='height:4em;'>\
								<div style='height:0.8em;width:2em;background-color:black;border:2px solid black;'></div>\
							</button>\
						</div>\
					</div>\
					<div class='middle-button' style='margin-left:15px;'>\
					  <label for='font-size'>Size</label><br/>\
					  <input type='text' id='font-size' readonly style='user-select:none;text-align:center;width:8em;border:0; color:#000000; font-weight:bold;'>\
					  <div id='font-size-slider' style='margin-top:10px;width:13em;'></div>\
					</div>\
				</div>"
	return middleButtons;
}

function initRightMiddleButtons() {
	var middleButtons = document.createElement("div")
	middleButtons.id = "right-middle-buttons"
	middleButtons.className = "other-buttons"
	middleButtons.style = "diplay:none;user-select:none;width:200px;"
	middleButtons.innerHTML += "\
				<div class='toolbar-selection' id='future-peek' style='text-align:center;display:inline-block;'>\
					<div class='middle-button' style='margin-top:22px;margin-left:2em;'>\
					  <label for='date-select'>Future Peek</label><br/>\
					  <input type='text' id='todays-date' readonly style='user-select:none;text-align:center;width:12em;px;border:0; color:#000000; font-weight:bold;'>\
					  <div id='todays-date-slider' style='margin-left:1em;margin-top:10px;width:15em;'></div>\
					</div>\
				</div>"
	return middleButtons;
}

function initRightButtons() {
	var rightButtons = document.createElement("div")
	rightButtons.id = "right-buttons"
	rightButtons.className = "other-buttons"
	rightButtons.innerHTML += "\
			<div class='toolbar-selection' id='draggables' style='display:inline-block;position:absolute;'>\
				<div id='finish-area' class='finish-area normal-finish' ondrop='dropFinish(event)' ondragover='highlightFinish(event)' ondragleave='unhighlightFinish(event)' style=''>\
					<i class='fa fa-check-square-o' aria-hidden='true' style='width:10px;margin-right:10px;'></i> Finished <br/><br/>\
					<span id='finish-instructions' ondragover='highlightFinish(event)' style='pointer-events: none;display:none;'>Drop here to Finish Task</span>\
					<span id='show-finished-toggle' style='position:absolute;bottom:0.2em;left:0em;width:100%;font-size:0.8em;'>\
						<button id='delete-finished-button' class='btn btn-default' style='padding:0.2em;margin-bottom:0.2em;display:none;' onclick='deleteAllFinished()'>\
							Delete All\
						</button><br/>\
						<span class='btn btn-default' style='border:0px;width:10em;background:radial-gradient(white,white,lightgrey,black,black);padding:0.2em;' onclick='toggleFinishedVisible()'>\
							<input style='margin-right:10px;pointer-events:none;' type='checkbox' id='show-finished' />Visible\
						</span>\
					</span>\
				</div>\
				<div id='new-task-drag' class='new-task-drag' draggable='true' ondragstart='dragNew(event)' >\
					Drag for new task\
				</div>\
				<br/>\
			</div>"
	return rightButtons;
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

function initToolSelector () {

	$(".toolbar-selection").hide();
	$("#tool-select-control").show();
	
	document.getElementById("new-task-drag").innerHTML = "New";
	//document.getElementById("output").marginTop = "30px";

	$("#tool-selector").change(function(){
		createCookie("selected-tool",this.value)
		$(".toolbar-selection").hide();
		$("#tool-select-control").append($("#"+this.value))
		$("#"+this.value).show();
		$("#"+this.value).style.left = "350px";
	});
	
	var alreadySelected = readCookie("selected-tool");
	if (!alreadySelected) alreadySelected = "new-open-file"
	$("#tool-selector").val(alreadySelected)
	$(".toolbar-selection").hide();
	$("#"+alreadySelected).show();
	$("#tool-select-control").append($("#"+alreadySelected))
}



function reverseToolSelector () {

	$(".toolbar-selection").show();
	$("#tool-select-control").hide();
	$("#left-buttons").append($("#new-open-file"))
	$("#left-middle-buttons").append($("#size-shape"))
	$("#right-middle-buttons").append($("#future-peek"))
	$("#right-buttons").append($("#draggables"))

	
	document.getElementById("new-task-drag").innerHTML = "Drag for New Task";
}


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

		