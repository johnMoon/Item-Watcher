// for each page(index), contain the known mapping of search pages 
var pageArray = [];
var userPage= 0; // page which the user is on
var parsedPage =0; // the highest search result page that has be parsed
var lastPage = 0; // the max page number for the search. parse page should not go beyond this
var currentSearchTerm= ""; // make sure to reset this every new search , (RAW)
		

// SEARCH

function searchKeyPress(e) {
	    e = e || window.event;
        if (e.keyCode == 13)
        {
            document.getElementById('searchButton').click();
        }
}


// call this function only when using the search box, not for pagination
function search() {
	var searchTerm = document.getElementById('input').value.replace("/", " ").trim();
	currentSearchTerm = searchTerm;
	pageArray = [];
	userPage = 1;
	lastPage=0;
	parsedPage-0;


	resetPagination(); // reset pagination ui elements to first page
	getSearchPage(searchTerm, userPage);

	
}

/**
Use this for all search
checks the page array to see if it has already calculated which raw search pages map to the results page
Each result page showned to the user has atleast 50items unless it is the last page

search term is raw, need to be encoded

**/
function getSearchPage(rawSearchTerm, pageNumber){
	// BUG! there are some (4) items that have / in them. currently search apis cant handle this.
	// wait for gw2 official api
	var searchTerm =encodeURIComponent(rawSearchTerm);

	if( searchTerm ) { // if not empty or null


	
	var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/"+searchTerm+"/"+pageNumber+"?callback=?";
	$.getJSON(spidy).done(function (data) {
		// Need to handle request failures and timeouts

		// get result statistics
		var itemCount = data.count;
		var currentPage =  data.page;
		lastPage =  data.last_page;
		var itemTotal =  data.total;

		// prepare content
		$('#resultList').empty();
		var div = $(document.createElement('div'));

		var p = $(document.createElement('p')).text("Raw count: " + itemCount);
		var result = $(div).append($(p));



		p = $(document.createElement('p')).text("Raw page: " + currentPage + "/" + lastPage);
		result = $(div).append($(p));
		p = $(document.createElement('p')).text("Raw total: " + itemTotal);
		result = $(div).append($(p));

		$(result).appendTo("#resultList");

		if (data.total==0){
			
			$(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;
			$(result).appendTo("#resultList");
			return;
		}
		
		var rawItems=[];

		$.each(data.results, function (i, item) {

			// prepare every item to be queried to see if sellable
			// we only need id since we can get the nessary data from 
			rawItems.push(item.data_id);

			//createSearchItem(item.data_id, item.img,  item.name,   item.rarity,item.restriction_level  );
		});

		console.log(rawItems);




		// note that this only works if there is atleast one valid item, HANDLE if all are invalid! valid = [json] not valid is json
		//validate items
		    searchItemIDs = encodeURIComponent(rawItems.join());
		    var names = "https://api.guildwars2.com/v2/items?ids=" + searchItemIDs;
		    

		    // not sure if need concurncy control. REVIEW when completely merged with the search window
			// apparently js is always single threaded
		    $.getJSON(names).done(function(data) {

		         $.each(data, function(i, item) {
    					console.log(item.flags);
    					var flags = item.flags;

		         		if ( $.inArray("AccountBound",flags)==-1 && $.inArray("SoulbindOnAcquire",flags)==-1) {


							
			               	createSearchItem(item.id, item.icon,  item.name,   item.rarity,item.level  );


		         		}
		       

		          
		            });
		                
		   
		        });






	}); ;
	} else {
		
			console.log("search term is empty");
	}


}


/**
update text
**/
function resetPagination() {

}

/**
Assumes that for every page > 1, the previous pages have already been mapped
ie. we know for a given page the corresponding result pages from spidy that gives
atleast 50 itesm

if not know, parse, and update page mapping array for future use

if the next page produces pages with no valid results check the next page
	if out of search pages, then dont change the user page (result should be the same).

update pagination variables and parsed pages	
**/
function nextPage(){


}


/**
Assumes that for every page > 1, the previous pages have already been mapped
ie. we know for a given page the corresponding result pages from spidy that gives
atleast 50 itesm

lookup pagination array for mapping

dont allow user to go below page 1

update pagination variables
**/
function prevPage(){


}

function createSearchItem(itemId, imageSrc, itemName, rarity, level){
			
			
	var li = $(document.createElement('li'));
	$(li).attr('id', "item-cell-"+itemId).addClass("search-item-cell" );
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
	span.addClass(rarity.toLowerCase()  );
	var button = $(document.createElement('button')).text("+");
	button.addClass( "right-button" );
	button.click(
		function() {
			addItem(itemId);
		}
		);
	var result = $(li).append($(img));
	result = $(li).append($(span));
	result = $(li).append($(button));
	$(result).appendTo("#resultList");

}

function addItem(itemId) {



	console.log(itemId);
	window.localStorage.setItem( "add-item-"+itemId,JSON.stringify( itemId )	  ); 
}


// This is dependant on api : currently spidy
// use toLowerCase() for offical api
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
