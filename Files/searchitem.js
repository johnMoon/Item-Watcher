// CONSTANTS
var gw2ItemUrl = "https://api.guildwars2.com/v2/items?ids=";
var callbackParam ="callback=?";
var spidySearchUrl="http://www.gw2spidy.com/api/v0.9/json/item-search/";

// for each page(index), contain the known mapping of items
var pageArray = [];
var userPage= 1; // page which the user is or wants to be on
var parsedPage =0; // the highest search result page that has be parsed
var lastPage = 1; // the max page number for the search. parse page should not go beyond this
var currentSearchTerm= ""; // make sure to reset this every new search , (RAW)
		
var tempIds =[];
var tempItemObjs = [];
		
		
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
	searchTerm =encodeURIComponent(searchTerm);
	// check is this is a new search term is the same as the loaded or loading on
	if (searchTerm == currentSearchTerm) {
		// check if it is the same page
		if (1 == userPage){
			// either its being loaded or is loaded already
			console.log("search is the same " + searchTerm, currentSearchTerm,1, userPage);

			return;
		}
		
	}
	
	currentSearchTerm = searchTerm;
	pageArray = [];
	userPage = 1;
	lastPage=1;
	parsedPage=0;

	tempIds =[];
	tempItemObjs = [];

	resetPagination(); // reset pagination ui elements to first page
	getSearchPage(searchTerm, userPage);

	
}

/**
Use this for all search
checks the page array to see if it has already calculated which raw search pages map to the results page
Each result page showned to the user has atleast 50items unless it is the last page

search term is raw, need to be encoded


sets the current page to the requested number, if 
that page is not possible(no items left), dont change page name
**/
function getSearchPage(searchTerm, pageNumber){
	// BUG! there are some (4) items that have / in them. currently search apis cant handle this.
	// wait for gw2 official api
	

	if( searchTerm ) { // if not empty or null
		var mapping = checkPreMapped(pageNumber);
		if (mapping){
			queryCleanItemIds(searchTerm,pageNumber, mapping);
			userPage = pageNumber;
		}
		else{
			// perform mapping for requested page
			queryCalculateItemMap(searchTerm,pageNumber);
		}
	
		//refresh pagination number
		//
	
	} else {
		
			console.log("search term is empty");
	}


}

function checkPreMapped(page) {
	return pageArray[page];
}

/**

assumes that we should start from the parsed paged counter

**/
function queryCalculateItemMap(searchTerm, pageNumber) {
	var itemCount ;
	var currentPage= parsedPage+1;
	var itemTotal ;
	

	if (currentPage> lastPage || tempIds.length > 50) {
		handleNewMappedResults(searchTerm,pageNumber);
		return;
	}
	var spidy = spidySearchUrl+searchTerm+"/"+currentPage+"?"+callbackParam;
	$.getJSON(spidy).done(function (data) {
		// Need to handle request failures and timeouts

		// get result statistics
		itemCount = data.count;
		lastPage =  data.last_page;
		itemTotal =  data.total;

		console.log(itemCount, itemTotal, lastPage);
		



		
		var rawItems=[];

		$.each(data.results, function (i, item) {
			rawItems.push(item.data_id);
		});

		console.log(rawItems);

		//TODO
		//note that this only works if there is atleast one valid item, HANDLE if all are invalid! valid = [json] not valid is json
		//validate items
		searchItemIDs = encodeURIComponent(rawItems.join());
		if (!searchItemIDs || 0 === searchItemIDs.length){
			handleNewMappedResults(searchTerm,pageNumber);
			return;
		}
		
		var names = gw2ItemUrl + searchItemIDs;
		    
		$.getJSON(names).done(function(data) {
			
			var localIds=[];
			var localObjs=[];
			
			
	         $.each(data, function(i, item) {
    			var flags = item.flags;
				if(!item){
					console.log("invalid item", item);
				}
					if ( $.inArray("AccountBound",flags)==-1 && $.inArray("SoulbindOnAcquire",flags)==-1) {
						localIds.push(item.id);
						localObjs.push({
								id: item.id,
								icon: item.icon,
								name: item.name,
								rarity: item.rarity,
								level: item.level	
								}
							);
							
							
		         		}
				});
				
			if (!(searchTerm==currentSearchTerm&& pageNumber==userPage)){
				// the search term or page got switch while this was being loaded
							console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, userPage);

				return;
			}
			
			tempIds = tempIds.concat(localIds);
			tempItemObjs =tempItemObjs.concat(localObjs);
			parsedPage =currentPage;
			 queryCalculateItemMap(searchTerm, pageNumber)
			});

	}); 
	

}

function handleNewMappedResults(searchTerm, pageNumber){
		if (!(searchTerm==currentSearchTerm&& pageNumber==userPage)){
			// the search term or page got switch while this was being loaded
			console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, userPage);

			return;
		}
		if (tempIds.length >0){
			console.log("a new page mappinig as been found " + pageNumber, tempIds);

			createSearchItems(tempItemObjs);	
			userPage = pageNumber;
			pageArray[pageNumber] = tempIds;
		} else {
			console.log("There are no more tradeabled items, and all have been parsed");
			// do nothing?
			// print out to user that there are no more items
			// unless its the first page, then we print out error 
			if (pageNumber==1){
				$('#resultList').empty();
				$(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;
			}
	
		}
		
		tempIds = [];
		tempItemObjs =[];
}


/**
assumes that the given id array contains validated ids

query office api
**/
function queryCleanItemIds(searchTerm, pageNumber, mapping){
	console.log("queryCleanItemIds ", mapping);

	searchItemIDs = encodeURIComponent(mapping.join());
	var names = gw2ItemUrl + searchItemIDs;
	// not sure if need concurncy control. REVIEW when completely merged with the search window
	// apparently js is always single threaded
	$.getJSON(names).done(function(data) {
		
		if (!(searchTerm==currentSearchTerm&& pageNumber==userPage)){
			// the search term or page got switch while this was being loaded
						console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, userPage);

			return;
		}
		createSearchItems(data);
	});
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

function createSearchItems(data) {
	$('#resultList').empty();
	$.each(data, function(i, item) {
		createSearchItem(item.id, item.icon,  item.name,   item.rarity,item.level  );
	});
	
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
