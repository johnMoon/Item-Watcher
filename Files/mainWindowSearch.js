var listWatchItemId = [];

function findMatchingItem() {
    var searchItem = document.getElementById("search").value.trim();

    console.log(searchItem);

    if (searchItem) {
        var spidy = "http://www.gw2spidy.com/api/v0.9/json/item-search/" + searchItem + "?callback=?";


        $.getJSON(spidy).done(function(data) {
            if (data.total != 1) {
                openSubWindow();
            }
            $.each(data.results, function(i, item) {
                if (item.name == searchItem) {

                    console.log("There is a matching Item");
                }
            });
        });

    }
}

function openSubWindow() {
    //alert("the subwindow will only be visible inside a game");
    overwolf.windows.obtainDeclaredWindow("SubWindow", function(result) {
        if (result.status == "success") {
            overwolf.windows.restore(result.window.id, function(result) {
                console.log(result);
            });
        }
    });
};



function testItemIdPress(e) {
    e = e || window.event;
    if (e.keyCode == 13) {
        // set the id somewhere
        // query

       // updateItemData();
        
    }
}


// should only need to run once per new watched item
// check if it items have been created yet, users can only add one at a time
// only creates one item, make a different method that loads multiple ids on start
function updateItemData(searchItemIDs) {
    searchItemIDs = encodeURIComponent(searchItemIDs);
    var names = "https://api.guildwars2.com/v2/items?ids=" + searchItemIDs;
    

    // not sure if need concurncy control. REVIEW when completely merged with the search window
	// apparently js is always single threaded
    $.getJSON(names).done(function(data) {

         $.each(data, function(i, item) {

                var itemName = item.name;
                var img = item.icon;
                var itemId= item.id;
                createSearchItem(itemId, itemName, img, "", "");
            });
                
        updateItemPrices();

        });

}

// Update data assumes that there is aleast one item already
// item id are stored in array and are valid tp 
// only update prices 
function updateItemPrices() {
   
    // note use the ids param

    //defensive
    if (listWatchItemId.length >0 ) {
      var prices = "https://api.guildwars2.com/v2/commerce/prices?ids=" + listWatchItemId.join();

        $.getJSON(prices).done(function(data) {


            $.each(data, function(i, item) {


                
                var sells = item.sells.unit_price;
                var buys = item.buys.unit_price;
                var itemId = item.id;
                // refer to buy element and sell element by id-buy or id-sell
                // price formating for prices
                $("#"+itemId+"-sell").text(buys);
                $("#"+itemId+"-buy").text(sells);
            });
        });
    }
}

// Timer on load
// if there is atleast 1 item watch, refresh every 30s






function createSearchItem(itemId, name, image, bPrice, sPrice) {

    //var li = $(document.createElement('li'));
    var table = $(document.createElement('table'));
    $(table).addClass("watch-header");
    var img = $(document.createElement('img')).attr('src', image);
    $(img).attr('height', "32").attr('width', "32");
    $(img).addClass("item-img");
    var span = $(document.createElement('span')).text(name);
    span.addClass("item-name");
    var button = $(document.createElement('button')).text("X");
    button.addClass("right-button");

    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    $(td3).append($(button));
    $(td).append($(img));
    $(td2).append(span);
    $(tr).append($(td));
    $(tr).append($(td2));
    $(tr).append($(td3));

    var result = $(table).append($(tr));




    var table2 = $(document.createElement('table'));
    $(table).addClass("watch-data");
    var tr2 = $(document.createElement('tr'));
    var td4 = $(document.createElement('td'));
    tr2.append($(td4));

    table2.append($(tr2));

    var tr3 = $(document.createElement('tr'));
    var td5 = $(document.createElement('td'));

    $(td5).attr('rowspan', "2").attr('align', "center").addClass("graph");
    var div = $(document.createElement('div'));

    $(div).attr('id', "curve_chart").attr('style', "width: 180x; height: 32px");
    td5.append($(div));
    tr3.append($(td5));

    var td6 = $(document.createElement('td'));
    $(td6).addClass("buy")
    td6.append("buy");

    tr3.append($(td6));

    var td7 = $(document.createElement('td'));
    $(td7).addClass("buying-price");
    var span2 = $(document.createElement('span')).text(bPrice);
    $(span2).attr("id", itemId +"-buy");
    td7.append(span2);

    tr3.append($(td7));

    table2.append($(tr3));


    var tr4 = $(document.createElement('tr'));

    var td8 = $(document.createElement('td'));
    $(td8).addClass("sell")
    td8.append("sell");

    tr4.append($(td8));

    var td9 = $(document.createElement('td'));
    $(td9).addClass("Selling-price");
    var span3 = $(document.createElement('span')).text(sPrice);
    $(span3).attr("id", itemId +"-sell");

    td9.append(span3);

    tr4.append(td9);

    table2.append($(tr4));

    result.append($(table2));
    $(result).appendTo("#testItem");


}


// check if there are any existing watched items
// reload them
// then turn on timer
$(function(){
    setInterval(
        function() {
            if (listWatchItemId.length > 0) {
                console.log("prices have been updated at "+ new Date());
                updateItemPrices();    
            }

            $("#updatetime").text(new Date());
       
        }, 5000);


	// check if there are any saved watched items
	// if there are any reload for local storage
	
	//updateItemData(searchItemIDs) 
	
	// if failed to reload from pervious save, delete the items 
	reloadItemListState();
	
});

// persistences
function saveItemListState(){
	
	window.localStorage.setItem( "item-list-state",	JSON.stringify( listWatchItemId)  ); 

}

function reloadItemListState(){
	console.log("Attempting to reload previous list state");
	var previousItemList = window.localStorage.getItem( "item-list-state"); 
	if (previousItemList) {
		// there was item list before
		listWatchItemId = JSON.parse( previousItemList );
		updateItemData(listWatchItemId);
	}
}

function onStorageEvent(storageEvent){
    console.log(storageEvent);
	
	
	

	if (storageEvent.key.indexOf("add-item-") !=-1) {
		// check if new
		var newId = JSON.parse( storageEvent.newValue );
		if (newId && $.inArray(newId,listWatchItemId)==-1) {
			listWatchItemId.push(newId);
			saveItemListState();
			
			// insert into array
			//create stucture
			updateItemData(newId);
		
		}
		
		// done with the event
		window.localStorage.removeItem(storageEvent.key);
	
	}
	
}
window.addEventListener('storage', onStorageEvent);

