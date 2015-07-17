var gw2ItemUrl = "https://api.guildwars2.com/v2/items?ids=";
var gw2TpUrl = "https://api.guildwars2.com/v2/commerce/prices?ids=";
var callbackParam = "callback=?";
var spidySearchUrl = "http://www.gw2spidy.com/api/v0.9/json/item-search/";


var validTpIdsQuery = "https://api.guildwars2.com/v2/commerce/prices";

var listValidIds = [];

var rarityChecked = [];
//
var isReady = false;

var isLoading = false;

var isFilterVisible = false;

var ischeckboxChecked = false;

var listCheckbox = [];
$.getJSON(validTpIdsQuery).done(function(data) {



    $.each(data, function(i, item) {
        listValidIds[item] = true;
    });

    isReady = true;
    removeSpinner();




});

$(document).ready(function() {

    $("#detailSearchButton").click(function() {

        // calls resizeListener when toggle is finished;
        $("#checkboxPanel").fadeToggle(400, "swing", function() {

            if ($("#checkboxPanel").is(":visible")) {

            } else {

            }

            resizeListener();




        });
        resizeListener();

    });




});




// for each page(index), contain the known mapping of items
var pageArray = [];
var requestedPage = 1; // page wants to be on
var currentPage = 1; // page user is currenty viewing
var parsedPage = 0; // the highest search result page that has be parsed
var lastPage = 1; // the max page number for the search. parse page should not go beyond this
var currentSearchTerm = ""; // make sure to reset this every new search , (RAW)


var tempIds = [];
var tempItemObjs = [];


// SEARCH

function searchKeyPress(e) {
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('searchButton').click();
    }
}


// call this function only when using the search box, not for pagination

//TODO: search need to check whether checkboxPanel is visible.
//TODO: If visible, find out what checkbox are checked, and do search according to it.
//TODO: if not visible, disable checkbox.
function search() {

    if (!isReady) {
        // im not ready yet
        return;
    }




    if (isLoading) {
        return;
    }

    isFilterVisible = $("#checkboxPanel").is(':visible');
    ischeckboxChecked = ($('#rarityFilter input:checkbox:checked').length > 0);
    listCheckbox = $('#rarityFilter input:checkbox:checked');


    var searchTerm = document.getElementById('input').value.replace("/", " ").trim();
    requestedPage = 1;
    searchTerm = encodeURIComponent(searchTerm);
    // check is this is a new search term is the same as the loaded or loading on


    currentSearchTerm = searchTerm;
    pageArray = [];

    lastPage = 1;
    parsedPage = 0;

    tempIds = [];
    tempItemObjs = [];

    $('#resultList').empty(); // new search, remove old data
    disablePagination(); // reset pagination ui elements to first page
    //addSpinner();  // This might be cause of bug
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
function getSearchPage(searchTerm, pageNumber) {
    // BUG! there are some (4) items that have / in them. currently search apis cant handle this.
    // wait for gw2 official api


    if (searchTerm) { // if not empty or null
        addSpinner();
        var mapping = checkPreMapped(pageNumber);
        if (mapping) {

            queryCleanItemIds(searchTerm, pageNumber, mapping);
            currentPage = pageNumber;
        } else {
            // perform mapping for requested page


            queryCalculateItemMap(searchTerm, pageNumber);
        }

        //refresh pagination number


    } else {
        requestedPage = currentPage;

    }


}

function checkPreMapped(page) {
    return pageArray[page];
}

/**

assumes that we should start from the parsed paged counter

**/
function queryCalculateItemMap(searchTerm, pageNumber) {
    var itemCount;
    var currentPage = parsedPage + 1;
    var itemTotal;


    if (currentPage > lastPage || tempIds.length > 50) {
        handleNewMappedResults(searchTerm, pageNumber);
        return;
    }
    var spidy = spidySearchUrl + searchTerm + "/" + currentPage; //+"?"+callbackParam;



    $.getJSON(spidy).done(function(data) {
        // Need to handle request failures and timeouts

        // get result statistics
        itemCount = data.count;
        lastPage = data.last_page;
        itemTotal = data.total;

        // if there are no 
        if (0 === itemCount) {
            handleNewMappedResults(searchTerm, pageNumber);

            return;
        }


        var rawItems = [];
        var rawObjs = [];

        $.each(data.results, function(i, item) {
            if (listValidIds[item.data_id]) {
                //put rarity options here.

                //TODO: save filter right after search
                //check if the filters have changed
                //if they have. research


                if (isFilterVisible) {
                    var itemRarity = getColorClass(item.rarity);

                    if (ischeckboxChecked) {
                        listCheckbox.each(function() {


                            if (itemRarity == $(this).val()) {

                                rawItems.push(item.data_id);
                                rawObjs.push({
                                    id: item.data_id,
                                    icon: item.img,
                                    name: item.name,
                                    rarity: item.rarity,
                                    level: item.restriction_level
                                });


                            }



                        });




                    } else {

                        rawItems.push(item.data_id);
                        rawObjs.push({
                            id: item.data_id,
                            icon: item.img,
                            name: item.name,
                            rarity: item.rarity,
                            level: item.restriction_level
                        });
                    }



                } else {




                    rawItems.push(item.data_id);
                    rawObjs.push({
                        id: item.data_id,
                        icon: item.img,
                        name: item.name,
                        rarity: item.rarity,
                        level: item.restriction_level
                    });



                }
            }

        });


        if (!(searchTerm == currentSearchTerm && pageNumber == requestedPage)) {
            // the search term or page got switch while this was being loaded


            return;
        }

        tempIds = tempIds.concat(rawItems);
        tempItemObjs = tempItemObjs.concat(rawObjs);
        parsedPage = currentPage;
        queryCalculateItemMap(searchTerm, pageNumber)


    }).fail(function(xhr, textStatus, errorThrown) {

        if (textStatus == "error") {
            // make global variables to default
            pageArray = [];
            requestedPage = 1;
            currentPage = 1;
            parsedPage = 0;
            lastPage = 1;


            $("#notificationItemName").text("The server is down at the moment. Please try again later.");

            $("#notificationItemName").css('color', "red");
            $("#notificationAlert").visible();
        }

        removeSpinner();
    });

}



function handleNewMappedResults(searchTerm, pageNumber) {
    if (!(searchTerm == currentSearchTerm && pageNumber == requestedPage)) {
        // the search term or page got switch while this was being loaded


        return;
    }
    if (tempIds.length > 0) {


        createSearchItems(tempItemObjs, true);
        pageArray[pageNumber] = tempIds;
        currentPage = requestedPage;
    } else {

        // do nothing?
        // print out to user that there are no more items
        // unless its the first page, then we print out error 
        if (pageNumber == 1) {
            $('#resultList').empty();
            $(document.createElement('p')).text("No items can be found.").appendTo("#resultList");;
        }
        requestedPage = currentPage;

    }

    removeSpinner();

    enablePagination();
    updatePageNumber()
    tempIds = [];
    tempItemObjs = [];
}


/**
assumes that the given id array contains validated ids

query office api
**/
function queryCleanItemIds(searchTerm, pageNumber, mapping) {


    searchItemIDs = encodeURIComponent(mapping.join());
    var names = gw2ItemUrl + searchItemIDs;
    // not sure if need concurncy control. REVIEW when completely merged with the search window
    // apparently js is always single threaded
    $.getJSON(names).done(function(data) {

        if (!(searchTerm == currentSearchTerm && pageNumber == requestedPage)) {
            // the search term or page got switch while this was being loaded


            return;
        }
        createSearchItems(data, false);
        removeSpinner();
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

function enablePagination() {
    $('#prevButton').prop('disabled', false);
    $('#pageNumber').prop('disabled', false);
    $('#nextButton').prop('disabled', false);
}

function updatePageNumber() {
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
function nextPage() {


    if (isLoading) {
        return;
    }
    // check if it is the same page
    if (currentPage != requestedPage) {
        // this means its currently being loaded
        // it will be gaurteed that the search term is the same since
        // pagination is be disabled when a search term is search for the first time


        return;
    }




    tempIds = [];
    tempItemObjs = [];
    requestedPage = currentPage + 1;
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
function prevPage() {


    if (isLoading) {
        return;
    }
    // check if it is the same page
    if (currentPage != requestedPage) {
        // this means its currently being loaded
        // it will be gaurteed that the search term is the same since
        // pagination is be disabled when a search term is search for the first time


        return;
    }

    tempIds = [];
    tempItemObjs = [];
    if (currentPage == 1) {
        return;
    }

    requestedPage = currentPage - 1;

    getSearchPage(currentSearchTerm, requestedPage);
}

function createSearchItems(data, bConvertRare) {
    $('#resultList').empty();
    $.each(data, function(i, item) {
        var rare = item.rarity;
        if (bConvertRare) {
            rare = getColorClass(rare)
        }
        createSearchItem(item.id, item.icon, item.name, rare, item.level);
    });

}

function createSearchItem(itemId, imageSrc, itemName, rarity, level) {


    var li = $(document.createElement('li'));
    $(li).attr('id', "item-cell-" + itemId).addClass("search-item-cell");
    var img = $(document.createElement('img')).attr('src', imageSrc);
    $(img).attr('height', "32").attr('width', "32");
    $(img).addClass("item-img");
    //add border around an image
    $(img).addClass(rarity.toLowerCase());
    onImageFail(img);


    var span = $(document.createElement('span')).text(itemName);

    if (level && level > 0) {
        var spanLevel = $(document.createElement('span')).text(" Lv. " + level);
        spanLevel.addClass("item-level");
        span.append($(spanLevel));
    }


    span.addClass("searchItemName");

    var button = $(document.createElement('button'));
    button.addClass("search-button search-add-position fa fa-plus ");

    button.click(
        function() {
            addItem(itemId, imageSrc, itemName, rarity, level);
        }
    );
    button.mouseup(function() {
        $(this).blur();
    });

    var result = $(li).append($(img));
    result = $(li).append($(span));
    result = $(li).append($(button));
    $(result).appendTo("#resultList");

}

function addSpinner() {
    $("#cog-spinner").addClass('active');
    isLoading = true;


}


function removeSpinner() {
    $("#cog-spinner").removeClass('active');
    isLoading = false;

}


function addItem(itemId, imageSrc, itemName, rarity, level) {

    window.localStorage.setItem("add-item-" + itemId, JSON.stringify({
        id: itemId,
        icon: imageSrc,
        name: itemName,
        rarity: rarity,
        level: level
    }));
}


// This is dependant on api : currently spidy
// use toLowerCase() for offical api
function getColorClass(rarityID) {
    switch (rarityID) {
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
            console.debug("Unknown rarityID " + rarityID);
            return "";
    }


}


// default image on error
function onImageFail(img) {
    $(img).error(function() {
        $(this).unbind("error").attr("src", "image/default_image.jpg");
    });
}


// Listeners

function resizeListener() {
    var content = $("#main-container");
    var searchHeader = $("#search-header");
    var resultContainer = $("#result-container");




    resultContainer.height(content.height() - searchHeader.height());




}


(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));

// resize on load!

$(function() {
    resizeListener();

    // any data hide alerts will hide instead of remove itself
    $("#notificationButton").on("click", function() {
        $("#notificationAlert").invisible();
        resizeListener();
    });
    // check if loading all tp items are done
    // if not then spin and lock search
    if (!isReady) {
        addSpinner();

    }

});



function onStorageEvent(storageEvent) {



    if (storageEvent.key.indexOf("item-exists") != -1) {


        $("#notificationItemName").css('color', "white");
        $("#notificationItemName").text("Item " + storageEvent.newValue + " is already watched");
        $("#notificationAlert").visible();

        resizeListener();
        // done with the event
        window.localStorage.removeItem(storageEvent.key);

    }

}

window.addEventListener('storage', onStorageEvent);