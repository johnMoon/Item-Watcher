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
				var rarity = item.rarity;
				var level = item.level;
                createSearchItem(itemId, itemName, rarity,img,level, "", "");
            });
                
        updateItemPrices();

        });

}

// Update data assumes that there is at least one item already
// item id are stored in array and are valid tp 
// only update prices 
function updateItemPrices() {
   
    // note use the ids param
	console.log("i am in updateItemPrices()");
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






function createSearchItem(itemId, name, rarity, image,level, bPrice, sPrice) {

    //var li = $(document.createElement('li'));
	var div = $(document.createElement('div'));	
		div.attr('id',"window-item-cell-" + itemId);
		div.addClass('mainWindow-item-cell');
		
	var img = $(document.createElement('img')).attr('src', image);
	 $(img).attr('height', "32").attr('width',"32");
	 $(img).addClass("item-img");
	 $(img).addClass(rarity.toLowerCase()+"-border");
	
	var p = $(document.createElement('p')).text(name);
		p.addClass('item-name');
		if (level && level > 0) {
		var spanLevel = $(document.createElement('span')).text(" Lv. " + level);
		spanLevel.addClass("item-level" );
		p.append($(spanLevel));
	}
	 var button = $(document.createElement('button')).text("X");
		button.click( 
		function(){removeItem(itemId);}
		);
	 
	 var div2 = $(document.createElement('div'));
	 div2.addClass('graph-buysell');
	
		
	 var img2 = $(document.createElement('img')).attr('src','https://www.google.com/jsapi?autoload={%20&#39;modules&#39;:[{%20&#39;name&#39;:&#39;visualization&#39;,%20&#39;version&#39;:&#39;1&#39;,%20&#39;packages&#39;:[&#39;corechart&#39;]%20}]%20}');
		$(img2).attr('width',"180x").attr('height',"32px");
	 var span = $(document.createElement('span'));
	 span.attr('width',"170px");
	 
		
		
		span.append($(img2));
		
	 div2.append(span);
	 
	 var div3 = $(document.createElement('div'));
	 div3.addClass('buy-sell-prices');
	 
	 var p2 =$(document.createElement('p')).text("Buy: ");
		 p2.addClass('buy-sell');
	 var span2 = $(document.createElement('span')).text(bPrice);
		 $(span2).attr("id", itemId +"-buy");
		 p2.append(span2);
	 
	var p3 = $(document.createElement('p')).text("Sell: "); 
		p3.addClass('buy-sell');
	var span3 = $(document.createElement('span')).text(sPrice);
		$(span3).attr("id", itemId +"-sell");
		p3.append(span3);
		
		div3.append(p2);
		div3.append(p3);
		
		div2.append(div3);
	
	var result = div.append($(img));
	result.append(p);
	result.append($(button));
	result.append(div2);
	//result.append(p2);
	//result.append(p3);

	
	
	
	
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


function removeItem(itemId){
console.log(itemId);

var index = listWatchItemId.indexOf(itemId);
listWatchItemId.splice(index,1);
saveItemListState();

$(".mainWindow-item-cell").remove("#window-item-cell-"+itemId);


}

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

