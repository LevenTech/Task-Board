
function initToolbar() {
	$(window).scroll(function(){
		if ($(window).scrollTop() > 56) {
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
}

function generateToolbar() {	
	var myToolbar = document.createElement("div")
	myToolbar.id = "taskboard-toolbar"
	myToolbar.className = "moving-toolbar"
	myToolbar.appendChild(createBR())
	myToolbar.appendChild(initLeftButtons())
	myToolbar.appendChild(initMiddleButtons())
	myToolbar.appendChild(initRightButtons())
	document.getElementById("myBody").append(myToolbar)
}

function getRemoteStorageIcon() {
	return "<img class='rs-cube rs-action' src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzIiIHdpZHRoPSIzMiIgdmVyc2lvbj0iMS4xIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KIDxkZWZzPgogIDxyYWRpYWxHcmFkaWVudCBpZD0iYSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGN5PSI1NzEuNDIiIGN4PSIxMDQ2LjUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjE0NDMzIDAgMCAuMTY2NjcgMTIwMS41IDg3Ny4xMSkiIHI9Ijk2Ij4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmNGEwNCIgc3RvcC1vcGFjaXR5PSIuNzYxNTQiIG9mZnNldD0iMCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY0YTA0IiBvZmZzZXQ9IjEiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogPC9kZWZzPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzMzYuNiAtOTU2LjM1KSI+CiAgPHBhdGggc3R5bGU9ImNvbG9yOiMwMDAwMDAiIGQ9Im0xMzUyLjYgOTU2LjM1IDAuMjg4NiAxNS4xMzYgMTMuNTY3LTcuMTM1Mi0xMy44NTUtOC4wMDExemwtMTMuODU1IDguMDAxMSAxMy41NjcgNy4xMzUyIDAuMjg4Ny0xNS4xMzZ6bS0xMy44NTUgOC4wMDExdjE1Ljk5OGwxMi45NTgtNy44MTYyLTEyLjk1OC04LjE4MTV6bTAgMTUuOTk4IDEzLjg1NSA4LjAwMTEtMC42MDg5LTE1LjMxNy0xMy4yNDYgNy4zMTU2em0xMy44NTUgOC4wMDExIDEzLjg1NS04LjAwMTEtMTMuMjUxLTcuMzE1Ni0wLjYwNDQgMTUuMzE3em0xMy44NTUtOC4wMDExdi0xNS45OThsLTEyLjk2MiA4LjE4MTUgMTIuOTYyIDcuODE2MnoiIGZpbGw9InVybCgjYSkiLz4KIDwvZz4KPC9zdmc+Cg=='>"
}

function initLeftButtons() {
	var leftButtons = document.createElement("div")
	leftButtons.id = "left-buttons"
	leftButtons.innerHTML += "\
			<div class='toolbar-selection' id='new-open-file' style='float:left;margin:10px;padding:10px;background:#F0F0F0;margin-left:15px;user-select:none;'>\
				<div id='open-local-file' class='fileinput fileinput-new' data-provides='fileinput' style='margin-left:0px;margin-bottom:0px;'>\
					<div id='chosen-file-label' style='margin-top:0px;margin-left:10px;'>\
						<div style='margin-bottom:10px'>\
							"+getRemoteStorageIcon()+"<span style='width:10px;'></span>\
							<span id='not-connected-to-remote'>Not </span>Connected to Remote Storage\
						</div>\
						<strong>Current File:</strong>\
						<span class='fileinput-filename'></span>\
						<span id='filename-display' class='fileinput-new' style='width:10em;'>No file chosen</span>\
						<span id='unsaved-changes' style='display:none;'>\
							<span class='tooltiptext'>Unsaved Changes</span>\
							<i class='fa fa-exclamation-triangle' aria-hidden='true'></i>\
						</span>\
						<select id='filename-selector' class='btn btn-default file-button' style='display:none;width:10em;'></select>\
						<div class='btn-group' role='group'>\
							<button id='newfile-button' class='btn btn-default file-button newfile-button' onclick='newFile()'>\
								<span class='tooltiptext'>New</span>\
								<i class='fa fa-clone' aria-hidden='true' style=''></i><span id='newfile-button-label'></span>\
							</button>\
							<button id='openfile-button' class='btn btn-default btn-file file-button' style='overflow:visible;'>\
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
								<input type='file' id='csvFileInput' style='cursor:pointer;' onchange='handleFiles(this.files)' onclick='this.value=null;' accept='.csv'/>\
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
			</div>\
			<div id='tool-select-control' style='font-size:24px;float:left;display:none;padding-left:1em;padding-right:1em;'>\
				<b>Control:</b><br/>\
				<select id='tool-selector' class='dropdown tool-selector' style='height:3em;'>\
					<option value='new-open-file'>New File / Open File</option>\
					<option value='draggables'>New Task / Finish Task</option>\
					<option value='size-shape'>Task Shape / Task Size</option>\
					<option value='future-peek'>Future Peek</option>\
				</select><br/>\
			</div>"
			return leftButtons;
}

function initMiddleButtons() {
	var middleButtons = document.createElement("div")
	middleButtons.id = "middle-buttons"
	middleButtons.style = "diplay:none;user-select:none;"
	middleButtons.innerHTML += "\
			<div style='width:100%;'>\
			<div class='toolbar-selection' id='size-shape' style='float:left;'>\
					<div class='middle-button' style='top:-0.5em;'>\
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
					<div class='middle-button' style='top:-2em;'>\
					  <label for='font-size'>Task size:</label>\
					  <input type='text' id='font-size' readonly style='user-select:none;text-align:center;width:8em;border:0; color:#000000; font-weight:bold;'>\
					  <div id='font-size-slider' style='margin-top:10px;width:13em;'></div>\
					</div>\
				</div>\
				<div class='toolbar-selection' id='future-peek' style='float:left;'>\
					<div class='middle-button' style='top:0em;margin-left:2em;'>\
					  <label for='date-select'>Show for:</label>\
					  <input type='text' id='todays-date' readonly style='user-select:none;text-align:center;width:12em;px;border:0; color:#000000; font-weight:bold;'>\
					  <div id='todays-date-slider' style='margin-left:1em;margin-top:10px;width:15em;'></div>\
					</div>\
				</div>\
			</div>"
	return middleButtons;
}

function initRightButtons() {
	var rightButtons = document.createElement("div")
	rightButtons.id = "right-buttons"
	rightButtons.innerHTML += "\
			<div class='toolbar-selection' id='draggables'>\
				<div id='finish-area' class='finish-area normal-finish' ondrop='dropFinish(event)' ondragover='highlightFinish(event)' ondragleave='unhighlightFinish(event)' style=''>\
					<i class='fa fa-check-square-o' aria-hidden='true' style='width:10px;margin-right:10px;'></i> Finished <br/><br/>\
					<span id='finish-instructions' ondragover='highlightFinish(event)' style='pointer-events: none;display:none;'>Drop here to Finish Task</span>\
					<span id='finished-list' style='pointer-events: none;'></span>\
					<span id='show-finished-toggle' style='position:absolute;bottom:0.2em;left:5.5em;font-size:0.8em;'>\
						<button id='delete-finished-button' class='btn btn-default' style='padding:0.2em;margin-bottom:0.2em;display:none;' onclick='deleteAllFinished()'>\
							Delete All\
						</button><br/>\
						<button class='btn btn-default' style='padding:0.2em;' onclick='toggleFinishedVisible()'>\
							<input style='margin-right:10px;pointer-events:none;' type='checkbox' id='show-finished' />Visible\
						</button>\
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
	
	document.getElementById("taskboard-toolbar").style.display="block"
	document.getElementById("left-buttons").style.width = "100%";
	document.getElementById("new-task-drag").style.marginTop = "0.4em";
	document.getElementById("new-task-drag").style.paddingTop = "1em";
	document.getElementById("new-task-drag").innerHTML = "New";
	document.getElementById("output").marginTop = "30px";
	$("#tool-selector").change(function(){
		createCookie("selected-tool",this.value)
		$(".toolbar-selection").hide();
		$("#left-buttons").append($("#"+this.value))
		$("#"+this.value).show();
		document.getElementById(this.value).style.fontSize = "25px";
	});
	
	var alreadySelected = readCookie("selected-tool");
	if (!alreadySelected) alreadySelected = "new-open-file"
	$("#tool-selector").val(alreadySelected)
	$(".toolbar-selection").hide();
	$("#left-buttons").append($("#"+alreadySelected))
	$("#"+alreadySelected).show();
	document.getElementById("open-local-file").style.fontSize = "22px";

	
	$("#taskboard-toolbar").addClass("padded-toolbar");
	$("#taskboard-toolbar").addClass("moving-toolbar");
	$("#app-header").addClass("padded-app-header");
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

		