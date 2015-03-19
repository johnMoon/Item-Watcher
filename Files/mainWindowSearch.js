


function findMatchingItem() {
	var searchItem = document.getElementById("search").value.trim();

	console.log(searchItem);

	if (searchItem) {
		var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/" + searchItem + "?callback=?";

<<<<<<< HEAD
		}).done(function(data){
		if(data.total != 1){
			openSubWindow();
		
		}
			
		$.each(data.results,function(i,item){
			if(item.name == searchItem){
			
			console.log("There is a matching Item");
			} 
			
			
			
			
			
		
		
		
		});
		
		
		
		
	

	});
	

	}}

=======
		$.getJSON(spidy, function (data) {
			console.log(data.results);
>>>>>>> f9693f9bb418f581e48e196da9ea9ddd620c14b9

		}).done(function (data) {
			console.log(!data.result);
			if (!data.result) {
				openSubWindow();

			}

			$.each(data.results, function (i, item) {
				if (item.name == searchItem) {

					console.log("There is a matching Item");
				}

			});

		});
	}
}

function openSubWindow() {
	//alert("the subwindow will only be visible inside a game");
	overwolf.windows.obtainDeclaredWindow("SubWindow", function (result) {
		if (result.status == "success") {
			overwolf.windows.restore(result.window.id, function (result) {
				console.log(result);
			});
		}
	});
};
