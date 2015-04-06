// CONSTANTS
var gw2ItemUrl = "https://api.guildwars2.com/v2/items?ids=";
var gw2TpUrl = "https://api.guildwars2.com/v2/commerce/prices?ids=";
var callbackParam ="callback=?";
var spidySearchUrl="http://www.gw2spidy.com/api/v0.9/json/item-search/";

// for each page(index), contain the known mapping of items
var pageArray = [];
var requestedPage= 1; // page wants to be on
var currentPage= 1; // page user is currenty viewing
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
	requestedPage = 1;
	searchTerm =encodeURIComponent(searchTerm);
	// check is this is a new search term is the same as the loaded or loading on
	if (searchTerm == currentSearchTerm) {
	//document.getElementById('searchButton').click();
		// check if it is the same page
		if (currentPage == requestedPage){
			// either its being loaded or is loaded already
			console.log("search is the same " + searchTerm, currentSearchTerm,currentPage, requestedPage);

			return;
		}
		
	}
	
	currentSearchTerm = searchTerm;
	pageArray = [];

	lastPage=1;
	parsedPage=0;

	tempIds =[];
	tempItemObjs = [];

	$('#resultList').empty();// new search, remove old data
	disablePagination(); // reset pagination ui elements to first page
	getSearchPage(searchTerm, requestedPage);

	
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
			console.log("Mapping has been found");
			queryCleanItemIds(searchTerm,pageNumber, mapping);
			currentPage = pageNumber;
		}
		else{
			// perform mapping for requested page
			console.log("No mapping");
			queryCalculateItemMap(searchTerm,pageNumber);
		}
	
		//refresh pagination number
		//
	
	} else {
			requestedPage = currentPage;
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
		var rawObjs=[];

		$.each(data.results, function (i, item) {
			rawItems.push(item.data_id);
			rawObjs[item.data_id] ={
						id: item.data_id,
						icon: item.img,
						name: item.name,
						rarity: item.rarity,
						level: item.restriction_level	
						};
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
		
		var names = gw2TpUrl + searchItemIDs;
		    
		$.getJSON(names).done(function(data) {
			
			var localIds=[];
			var localObjs=[];
			
			// check if the data is in  a array?
			// seems like api sends a 404 error so we dont need to check
			
	         $.each(data, function(i, item) {
				if(!item){
					console.log("invalid item", item);
				}
				
						localIds.push(item.id);
						localObjs.push(
						rawObjs[item.id]
							);
							
							
		         		
				});
				
			if (!(searchTerm==currentSearchTerm&& pageNumber==requestedPage)){
				// the search term or page got switch while this was being loaded
							console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, requestedPage);

				return;
			}
			
			tempIds = tempIds.concat(localIds);
			tempItemObjs =tempItemObjs.concat(localObjs);
			parsedPage =currentPage;
			 queryCalculateItemMap(searchTerm, pageNumber)
			})  .fail(function() {
				// this page only contained invalid results
				console.log("This page only contained invalid results", currentPage, searchTerm);
				parsedPage =currentPage;
				queryCalculateItemMap(searchTerm, pageNumber)

			});

	}); 
	

}

function handleNewMappedResults(searchTerm, pageNumber){
		if (!(searchTerm==currentSearchTerm&& pageNumber==requestedPage)){
			// the search term or page got switch while this was being loaded
			console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, requestedPage);

			return;
		}
		if (tempIds.length >0){
			console.log("a new page mappinig as been found " + pageNumber, tempIds);

			createSearchItems(tempItemObjs,true);	
			pageArray[pageNumber] = tempIds;
			currentPage = requestedPage;
		} else {
			console.log("There are no more tradeabled items, and all have been parsed");
			// do nothing?
			// print out to user that there are no more items
			// unless its the first page, then we print out error 
			if (pageNumber==1){
				$('#resultList').empty();
				$(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;
			}
		requestedPage=currentPage ;
	
		}
		//document.getElementById('searchButton').click();
		enablePagination();
		updatePageNumber()
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
		
		if (!(searchTerm==currentSearchTerm&& pageNumber==requestedPage)){
			// the search term or page got switch while this was being loaded
						console.log("search was changed " + searchTerm, currentSearchTerm,pageNumber, requestedPage);

			return;
		}
		createSearchItems(data, false);
		updatePageNumber();
	});
}


/**
update text
**/
function disablePagination() {
        $('#prevButton').prop('disabled', true);
        $('#pageNumber').prop('disabled', true);
        $('#nextButton').prop('disabled', true);

}

function enablePagination(){
    $('#prevButton').prop('disabled', false);
    $('#pageNumber').prop('disabled', false);
	$('#nextButton').prop('disabled', false);
}

function updatePageNumber(){
	$("#pageNumber").text(currentPage);
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
	console.log("next page button is pressed");


		// check if it is the same page
	if (currentPage != requestedPage){
		// this means its currently being loaded
		// it will be gaurteed that the search term is the same since
		// pagination is be disabled when a search term is search for the first time
		console.log("change paged as already been requested " + currentSearchTerm,currentPage, requestedPage);

		return;
	}
		
	


	tempIds =[];
	tempItemObjs = [];
	requestedPage=currentPage+1;
	getSearchPage(currentSearchTerm, requestedPage);

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
	console.log("previous page button is pressed");
		// check if it is the same page
	if (currentPage != requestedPage){
		// this means its currently being loaded
		// it will be gaurteed that the search term is the same since
		// pagination is be disabled when a search term is search for the first time
		console.log("change paged as already been requested " + currentSearchTerm,currentPage, requestedPage);

		return;
	}
		
	tempIds =[];
	tempItemObjs = [];
 	if (currentPage == 1) {
		  return;
	 }

	requestedPage = currentPage-1;
	 
	getSearchPage(currentSearchTerm, requestedPage);
}

function createSearchItems(data, bConvertRare) {
	$('#resultList').empty();
	$.each(data, function(i, item) {
		var rare = item.rarity;
		if (bConvertRare) {
		 rare = getColorClass( rare) 
		}
		createSearchItem(item.id, item.icon,  item.name,  rare,item.level  );
	});
	
}

function createSearchItem(itemId, imageSrc, itemName, rarity, level){
			
			
	var li = $(document.createElement('li'));
	$(li).attr('id', "item-cell-"+itemId).addClass("search-item-cell" );
	var img = $(document.createElement('img')).attr('src', imageSrc);
	$(img).attr('height', "32").attr('width', "32");
	$(img).addClass("item-img");
	//add border around an image
	$(img).addClass(rarity.toLowerCase());
	onImageFail(img);
	
	
	var span = $(document.createElement('span')).text(itemName);
	
	if (level && level > 0) {
		var spanLevel = $(document.createElement('span')).text(" Lv. " + level);
		spanLevel.addClass("item-level" );
		span.append($(spanLevel));
	}
	
	
	span.addClass("item-name" );
	var button = $(document.createElement('button'));
	button.addClass( "right-button  glyphicon glyphicon-plus btnModified btnModified-primary btnModifed-lg outline " );
	button.click(
		function() {
			addItem(itemId,imageSrc, itemName, rarity, level);
		}
		);
	var result = $(li).append($(img));
	result = $(li).append($(span));
	result = $(li).append($(button));
	$(result).appendTo("#resultList");

}

$(function(){
    $('a, button').click(function() {
        $(this).toggleClass('active');
    });
});

function addItem(itemId,imageSrc, itemName, rarity, level) {

	window.localStorage.setItem( "add-item-"+itemId,JSON.stringify( 
		{id:itemId,icon:imageSrc, name:itemName, rarity:rarity, level:level} )
			  ); 
}


// This is dependant on api : currently spidy
// use toLowerCase() for offical api
function getColorClass( rarityID) {
switch(rarityID) {
    case 0:
        return "junk";
        break;
    case 1:
        return "basic";
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

$(".blur").mouseup(function(){
	console.log("blur")
   $(this).blur();
});

// any data hide alerts will hide instead of remove itself
    $("#notificationButton").on("click", function(){
        $("#notificationAlert").hide();
		resizeListener();
    });


});



function onStorageEvent(storageEvent){
	
	
	console.log("onStorageEvent" ,storageEvent);
	if (storageEvent.key.indexOf("item-exists") !=-1) {

		console.log("item exists!" ,storageEvent);
		$("#notificationItemName").text(storageEvent.newValue);
		$("#notificationAlert").show();
		resizeListener();
		// done with the event
		window.localStorage.removeItem(storageEvent.key);
	
	}
	
}

window.addEventListener('storage', onStorageEvent);
