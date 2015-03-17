
function searchKeyPress(e) {
	    e = e || window.event;
        if (e.keyCode == 13)
        {
            document.getElementById('searchButton').click();
        }
}


function search() {
	var searchTerm = document.getElementById('input').value.replace("/", " ").trim();
	console.log(searchTerm);
	console.log(encodeURIComponent(searchTerm));
	searchTerm =encodeURIComponent(searchTerm);
	// BUG! there are some (4) items that have / in them. currently search apis cant handle this.
	// wait for gw2 official api
	if( searchTerm ) { // if not empty or null

	var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/"+searchTerm+"?callback=?";
		console.log(spidy);
	$.getJSON(spidy, function (data) {
		console.log(data);
		console.log(data.count);
		console.log(data.last_page);
		console.log(data.page);
		console.log(data.results);
		console.log(data.total);

	}).done(function (data) {
		// Need to handle request failures and timeouts
		$('#resultList').empty();
		var div = $(document.createElement('div'));

		var p = $(document.createElement('p')).text("count: " + data.count);
		var result = $(div).append($(p));

		p = $(document.createElement('p')).text("page: " + data.page + "/" + data.last_page);
		result = $(div).append($(p));
		p = $(document.createElement('p')).text("total: " + data.total);
		result = $(div).append($(p));

		$(result).appendTo("#resultList");

		if (data.total==0){
			
			$(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;

		$(result).appendTo("#resultList");
			return;
		}
		
		$.each(data.results, function (i, item) {


			createSearchItem(i, item.img,  item.name)
		});
	}); ;
	} else {
		
			console.log("search term is empty");
	}
	
}



function createSearchItem(index, imageSrc, itemName){
			
	var li = $(document.createElement('li'));
	$(li).attr('id', "item-cell-"+index).addClass("search-item-cell" );
	var img = $(document.createElement('img')).attr('src', imageSrc);
	$(img).attr('height', "32").attr('width', "32");
	$(img).addClass("item-img");
	var span = $(document.createElement('span')).text(itemName);
	span.addClass("item-name" );
	var button = $(document.createElement('button')).text("X");
	button.addClass( "right-button" );

	var result = $(li).append($(img));
	result = $(li).append($(span));
	result = $(li).append($(button));
	$(result).appendTo("#resultList");

}
