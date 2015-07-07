
function dragResize(edge){
				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
						overwolf.windows.dragResize(result.window.id, edge);
					}
				});
			};
			
			function dragMove(){
				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
						overwolf.windows.dragMove(result.window.id);
					}
				});
			};
			
			function closeWindow(){
				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
				
						overwolf.windows.close(result.window.id);
					}
				});
			};
			function minimizeWindow(){
				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
				
						overwolf.windows.minimize(result.window.id);
					}
				});
			};
		 
	
			function stopEvent(ev) {

			  // this ought to keep t-daddy from getting the click.
			  ev.stopPropagation();
			};
			
			
function openHelpPage() {
	overwolf.windows.obtainDeclaredWindow("HelpWindow", function (result) {
		if (result.status == "success") {
			overwolf.windows.restore(result.window.id, function (result) {

			});
		}
	});
	$("#help-button").blur();
};
function openSubWindow() {
	overwolf.windows.obtainDeclaredWindow("SubWindow", function (result) {
		if (result.status == "success") {
			overwolf.windows.restore(result.window.id, function (result) {

			});
		}
	});
	$("#open-subwindow").blur();
};

		function load() {
				ignoreMouseEvent("close");
				ignoreMouseEvent("add");
				ignoreMouseEvent("option");
			};
		function ignoreMouseEvent(id) {
			elem = document.getElementById(id);
			elem.addEventListener("mousedown", stopEvent, false);
		};	
			