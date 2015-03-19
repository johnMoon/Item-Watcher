
		

// SEARCH

function searchKeyPress(e) {
	    e = e || window.event;
        if (e.keyCode == 13)
        {
            document.getElementById('searchButton').click();
        }
}


function search() {
	var searchTerm = document.getElementById('input').value.replace("/", " ").trim();
	searchTerm =encodeURIComponent(searchTerm);
	// BUG! there are some (4) items that have / in them. currently search apis cant handle this.
	// wait for gw2 official api
	if( searchTerm ) { // if not empty or null

	var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/"+searchTerm+"?callback=?";
	$.getJSON(spidy).done(function (data) {
		// Need to handle request failures and timeouts

		// get result statistics
		var itemCount = data.count;
		var currentPage =  data.page;
		var lastPage =  data.last_page;
		var itemTotal =  data.total;

		// prepare content
		$('#resultList').empty();
		var div = $(document.createElement('div'));

		var p = $(document.createElement('p')).text("count: " + itemCount);
		var result = $(div).append($(p));



		p = $(document.createElement('p')).text("page: " + currentPage + "/" + lastPage);
		result = $(div).append($(p));
		p = $(document.createElement('p')).text("total: " + itemTotal);
		result = $(div).append($(p));

		$(result).appendTo("#resultList");

		if (data.total==0){
			
			$(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;

		$(result).appendTo("#resultList");
			return;
		}
		
		$.each(data.results, function (i, item) {


			createSearchItem(i, item.img,  item.name,   item.rarity,item.restriction_level  );
		});
	}); ;
	} else {
		
			console.log("search term is empty");
	}
	
}



function createSearchItem(index, imageSrc, itemName, rarity, level){
			
			
	var li = $(document.createElement('li'));
	$(li).attr('id', "item-cell-"+index).addClass("search-item-cell" );
	var img = $(document.createElement('img')).attr('src', imageSrc);
	$(img).attr('height', "32").attr('width', "32");
	$(img).addClass("item-img");
	onImageFail(img);
	
	
	var span = $(document.createElement('span')).text(itemName);
	
	if (level && level > 0) {
		var spanLevel = $(document.createElement('span')).text(" Lv. " + level);
		spanLevel.addClass("item-level" );
		span.append($(spanLevel));
	}
	
	
	span.addClass("item-name" );
	span.addClass(getColorClass(rarity)  );
	var button = $(document.createElement('button')).text("+");
	button.addClass( "right-button" );

	var result = $(li).append($(img));
	result = $(li).append($(span));
	result = $(li).append($(button));
	$(result).appendTo("#resultList");

}

// This is dependant on api : currently spidy


function getColorClass( rarityID) {
switch(rarityID) {
    case 0:
        return "junk";
        break;
    case 1:
        return "common";
        break;
    case 2:
        return "fine";
        break;
    case 3:
        return "masterwork";
        break;
    case 4:
        return "rare";
        break;
    case 5:
        return "exotic";
        break;
    case 6:
        return "ascended";
        break;
    case 7:
        return "legendary";
        break;
    default:
    	console.log("Unknown rarityID "  + rarityID);
     	return "";
}


}


// default image on error
function onImageFail(img){
$(img).error(function () {
 	 $(this).unbind("error").attr("src", "image/default_image.jpg");
	});
}


// Listeners

function resizeListener() {
	var content = $("#content");
	var searchHeader = $("#search-header");
	var resultContainer = $("#result-container");
	resultContainer.height(content.height() - searchHeader.height() );
	
}





// resize on load!

$(function(){
   resizeListener();
});
