
function searchKeyPress(e) {
	    e = e || window.event;
        if (e.keyCode == 13)
        {
            document.getElementById('searchButton').click();
        }
}


function search() {
	var searchTerm = document.getElementById('input').value.trim();
	console.log(searchTerm);
	if( searchTerm ) { // if not empty or null

	var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/"+searchTerm+"?callback=?";
	$.getJSON(spidy, function (data) {
		console.log(data);
		console.log(data.count);
		console.log(data.last_page);
		console.log(data.page);
		console.log(data.results);
		console.log(data.total);

	}).done(function (data) {
		$('#results').empty();
		var div = $(document.createElement('div'));

		var p = $(document.createElement('p')).text("count: " + data.count);
		var result = $(div).append($(p));

		p = $(document.createElement('p')).text("page: " + data.page + "/" + data.last_page);
		result = $(div).append($(p));
		p = $(document.createElement('p')).text("total: " + data.total);
		result = $(div).append($(p));

		$(result).appendTo("#results");

		$.each(data.results, function (i, item) {

			var div = $(document.createElement('div'));
			div.text(i);
			var span = $(document.createElement('span')).text(item.data_id + " " + item.name);
			var img = $(document.createElement('img')).attr('src', item.img);
			var result = $(div).append($(img));
			result = $(div).append($(span));
			$(result).appendTo("#results");

		});
	}); ;
	} else {
		
			console.log("search term is empty");
	}
	
}
