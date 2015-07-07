
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
		
		
	
			function stopEvent(ev) {

			  // this ought to keep t-daddy from getting the click.
			  ev.stopPropagation();
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
			