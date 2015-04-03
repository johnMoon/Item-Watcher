var listWatchItemId = [];
var listCharts = {};
var newFrequency;

function openSubWindow() {
	overwolf.windows.obtainDeclaredWindow("SubWindow", function (result) {
		if (result.status == "success") {
			overwolf.windows.restore(result.window.id, function (result) {

			});
		}
	});
};

//////////// CHARTING


function drawChart(chartDiv, itemId) {

	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', 'Buy');
	data.addColumn('number', 'Sell');
	var chart = new google.visualization.LineChart(chartDiv);
	listCharts[itemId] = {
		chart : chart,
		data : data
	};
	chart.draw(data, chartOptions);

}
var maxDataPoints = 20;

var chartOptions = {

	backgroundColor : {
		fill : '#E4E4E4',
		stroke : '#4322c0',
		strokeWidth : 1,

	},
	'width' : 150,
	'height' : 40,
	hAxis : {
		textPosition : 'none',
		gridlines : {
			color : 'transparent'
		},
		baseline : {
			color : 'transparent'
		},
	},
	vAxis : {
		textPosition : 'none',
		gridlines : {
			color : 'transparent'
		},
		baseline : {
			color : 'transparent'
		},
	},
	legend : {
		position : 'none'
	},
	enableInteractivity : false,
	tooltip : {
		trigger : 'none'
	},
	chartArea : {
		left : 3,
		top : 2,
		width : 146,
		height : 36,

	}

};

function addDataPoint(itemId, buy, sell) {
	var chartObj = listCharts[itemId];
	var chart = chartObj["chart"];
	var data = chartObj["data"];
	var currentDate = new Date();
	var dataNum = data.getNumberOfRows();
	if (data.getNumberOfRows() == 0) {
		// hack to get a line always
		data.addRow([currentDate.getTime() - 1, buy, sell]);
	} else if (dataNum >= maxDataPoints) {
		data.removeRow(0);
	}
	data.addRow([currentDate.getTime(), buy, sell]);
	chart.draw(data, chartOptions);
}
////////////


// should only need to run once per new watched item and if obj isnt passed ie on reload
// only creates one item, make a different method that loads multiple ids on start
function updateItemData(searchItemIDs) {
	searchItemIDs = encodeURIComponent(searchItemIDs);
	var names = "https://api.guildwars2.com/v2/items?ids=" + searchItemIDs;

	// not sure if need concurncy control. REVIEW when completely merged with the search window
	// apparently js is always single threaded
	$.getJSON(names).done(function (data) {
		parseObjsAndUpdate(data);

	});

}

function parseObjsAndUpdate(itemObj) {
	$.each(itemObj, function (i, item) {

		var itemName = item.name;
		var img = item.icon;
		var itemId = item.id;
		var rarity = item.rarity;
		var level = item.level;
		createWatchItem(itemId, itemName, rarity, img, level);
	});

	updateItemPrices();
}

// Update data assumes that there is at least one item already
// item id are stored in array and are valid tp
// only update prices
function updateItemPrices() {

	// note use the ids param
	//defensive
	if (listWatchItemId.length > 0) {
		var prices = "https://api.guildwars2.com/v2/commerce/prices?ids=" + listWatchItemId.join();

		$.getJSON(prices).done(function (data) {

			$.each(data, function (i, item) {

				var sells = item.sells.unit_price;
				var buys = item.buys.unit_price;
				var itemId = item.id;

				addDataPoint(itemId, buys, sells);

				updatePriceHelper(itemId, buys, "buy");
				updatePriceHelper(itemId, sells, "sell");

			});
		});
	}
}

function updatePriceHelper(itemId, price, buySell) {
	var gold = (price - (price % 10000)) / 10000;
	var silver = (price % 10000 - (price % 100)) / 100;
	var copper = price % 100;
	$("#" + itemId + "-"+buySell+"Copper").text(copper);

	if (silver > 0 || gold > 0) {
		if (gold > 0) {
			$("#" + itemId + "-"+buySell+"Gold").text(gold);
			$("#" + itemId + "-"+buySell+"GoldIcon").show();

		} else {
			$("#" + itemId + "-"+buySell+"Gold").empty();
			$("#" + itemId + "-"+buySell+"GoldIcon").hide();
		}
		$("#" + itemId + "-"+buySell+"Silver").text(silver);
		$("#" + itemId + "-"+buySell+"SilverIcon").show();
	} else {
		$("#" + itemId + "-"+buySell+"Gold").empty();
		$("#" + itemId + "-"+buySell+"Silver").empty();
		$("#" + itemId + "-"+buySell+"GoldIcon").hide();
		$("#" + itemId + "-"+buySell+"SilverIcon").hide();
	}
}

function createWatchItem(itemId, name, rarity, image, level) {

	var cellDiv = $(document.createElement('div'));
	cellDiv.attr('id', "window-item-cell-" + itemId);
	cellDiv.addClass('mainWindow-item-cell');

	var iconImg = $(document.createElement('img'));
	$(iconImg).attr('src', image).attr('height', "32").attr('width', "32");
	$(iconImg).addClass(rarity.toLowerCase() + " item-img");

	var itemName = $(document.createElement('p')).text(name);
	itemName.addClass('item-name');
	if (level && level > 0) {
		var spanLevel = $(document.createElement('span')).text(" Lv. " + level);
		spanLevel.addClass("item-level");
		itemName.append($(spanLevel));
	}
	var removeButton = $(document.createElement('button')).text("X");
	removeButton.click(
		function () {
		removeItem(itemId);
	});

	var priceContainer = $(document.createElement('div'));
	priceContainer.addClass('graph-buysell');

	var chartDiv = $(document.createElement('div'));
	chartDiv.addClass("chart-div");
	drawChart($(chartDiv)[0], itemId);

	priceContainer.append(chartDiv);

	var priceDiv = $(document.createElement('div'));
	priceDiv.addClass('buy-sell-prices');

	var buyElem =createPriceElement(itemId, "buy");
	var sellElem = createPriceElement(itemId, "sell");
	priceDiv.append(sellElem, buyElem);
	


	priceContainer.append(priceDiv);

	var result = cellDiv.append(iconImg, itemName,removeButton,priceContainer);	


	$(result).appendTo("#watchlist-container");

}

function createPriceElement(itemId, buySell){
	var label = "Sell:";
	if (buySell == "buy"){
		label= "Buy:"
	}
	var buyElem = $(document.createElement('p')).text(label);
	buyElem.addClass('buy-sell');

	var buyGold = $(document.createElement('span'));
	$(buyGold).attr("id", itemId + "-"+buySell+"Gold");

	var buySilver = $(document.createElement('span'));

	$(buySilver).attr("id", itemId + "-"+buySell+"Silver");

	var buyCopper = $(document.createElement('span')).text("0");
	$(buyCopper).attr("id", itemId + "-"+buySell+"Copper");

	var goldImage = $(document.createElement('img')).attr('src', 'image/Gold_coin.png').attr("id", itemId + "-"+buySell+"GoldIcon");
		
	var silverImage = $(document.createElement('img')).attr('src', 'image/Silver_coin.png').attr("id", itemId + "-"+buySell+"SilverIcon");
		
	var copperImage = $(document.createElement('img')).attr('src', 'image/Copper_coin.png').attr("id", itemId + "-"+buySell+"CopperIcon");
		
	
	
	$([goldImage, silverImage, copperImage]).each(function(i,value) {
    value.addClass("price-Image");
});
	

	$(goldImage, silverImage).hide();
	buyElem.append(buyGold, goldImage, buySilver, silverImage, buyCopper, copperImage);

	return buyElem;
}

// check if there are any existing watched items
// reload them
// then turn on timer

$(document).ready(function () {
	var frequency;
	var prevFrequency = window.localStorage.getItem("frequency");
	if (prevFrequency) {
		// there was item list before
		frequency = JSON.parse(prevFrequency);
		document.getElementById("frequency-changer").value = localStorage['frequency'];
	} else {
		frequency = document.getElementById("frequency-changer").value;
	}
	changeFrequency();

	reloadItemListState();

});

var frequencyInterval;

function changeFrequency() {

	if (frequencyInterval) {
		window.clearInterval(frequencyInterval);
	}

	newFrequency = document.getElementById("frequency-changer").value;

	saveFrequency();
	frequencyInterval = setInterval(

			function () {

			if (listWatchItemId.length > 0) {
				updateItemPrices();
			}

		}, newFrequency);

};

function saveFrequency() {

	window.localStorage.setItem('frequency', newFrequency);

}

function removeItem(itemId) {

	var index = listWatchItemId.indexOf(itemId);
	listWatchItemId.splice(index, 1);
	saveItemListState();
	$(".mainWindow-item-cell").remove("#window-item-cell-" + itemId);

}

// persistences
function saveItemListState() {

	window.localStorage.setItem("item-list-state", JSON.stringify(listWatchItemId));

}

function reloadItemListState() {
	console.log("Attempting to reload previous list state");
	var previousItemList = window.localStorage.getItem("item-list-state");
	if (previousItemList) {
		// there was item list before
		listWatchItemId = JSON.parse(previousItemList);
		updateItemData(listWatchItemId);
	}
}

function onStorageEvent(storageEvent) {

	if (storageEvent.key.indexOf("add-item-") != -1) {
		// check if new
		var obj = JSON.parse(storageEvent.newValue);
		var newId = obj.id;
		if (newId && $.inArray(newId, listWatchItemId) == -1) {
			listWatchItemId.push(newId);
			saveItemListState();

			parseObjsAndUpdate([obj])

		} else {
			// tell search window that the item has already been added
			window.localStorage.setItem("item-exists", obj.name);
		}

		// done with the event
		window.localStorage.removeItem(storageEvent.key);

	}

}

function resizeListener() {
	var content = $("#watchListContents");
	var header = $("#header");
	var watchListContainer = $("#watchlist-container");
	watchListContainer.height(content.height() - header.height());

}

// resize on load!

$(function () {
	resizeListener();
});

window.addEventListener('storage', onStorageEvent);
