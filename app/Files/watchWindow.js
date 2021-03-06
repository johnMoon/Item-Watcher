﻿var listWatchItemId = [];
var itemIdOptions = []; // indexed by item, contains options
var listHistCharts = [];
var listSupplyCharts = [];
var defaultFrequency = 10000; // make sure this is the same as option/watch


var orangeHex = '#F0A000';
var redHex = '#dc3912';
var blueHex = '#3366cc';
var greenHex = '#109618';


// make sure these agree with css
var defaultR = '26';
var defaultG = '33';
var defaultB = '32';
var defaultA = '0.8';



//////////// CHARTING


function drawHistChart(chartDiv, itemId) {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Buy');
    data.addColumn('number', 'Sell');
    var chart = new google.visualization.LineChart(chartDiv);
    listHistCharts[itemId] = {
        chart: chart,
        data: data
    };
    chart.draw(data, chartHistOptions);

};
var maxHistDataPoints = 20;

var chartHistOptions = {

    backgroundColor: {
        fill: 'transparent',


    },
    'width': 300,
    'height': 40,
    hAxis: {
        textPosition: 'none',
        gridlines: {
            color: 'transparent'
        },
        baseline: {
            color: 'transparent'
        },
    },
    vAxis: {
        textPosition: 'none',
        gridlines: {
            color: 'transparent'
        },
        baseline: {
            color: 'transparent'
        },
    },
    legend: {
        position: 'none'
    },
    enableInteractivity: false,
    tooltip: {
        trigger: 'none'
    },
    chartArea: {
        left: 2,
        top: 2,
        width: 296,
        height: 36,

    }

};

function addHistDataPoint(itemId, buy, sell) {
    var chartObj = listHistCharts[itemId];
    var chart = chartObj["chart"];
    var data = chartObj["data"];
    var currentDate = new Date();
    var dataNum = data.getNumberOfRows();
    if (data.getNumberOfRows() == 0) {
        // hack to get a line always

        for (var i = 0; i < maxHistDataPoints; i++) {

            data.addRow([currentDate.getTime() - (frequency * (maxHistDataPoints - i)), buy, sell]);
        }


    } else if (dataNum >= maxHistDataPoints) {
        data.removeRow(0);
    }
    data.addRow([currentDate.getTime(), buy, sell]);
    chart.draw(data, chartHistOptions);
};


///////////////// Supply charts


function drawSupplyChart(chartDiv, itemId) {


    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Bucket');
    data.addColumn('number', 'Price');
    data.addColumn({
        type: 'string',
        role: 'tooltip'
    });
    data.addColumn({
        type: 'string',
        role: 'style'
    });
    data.addColumn('number', 'Orders');
    data.addColumn({
        type: 'string',
        role: 'tooltip'
    });

    data.addColumn('number', 'Gap');
    data.addColumn({
        type: 'number',
        role: 'interval'
    });
    data.addColumn({
        type: 'number',
        role: 'interval'
    });
    data.addColumn({
        type: 'string',
        role: 'tooltip'
    });
    var chart = new google.visualization.ComboChart(chartDiv);
    listSupplyCharts[itemId] = {
        chart: chart,
        data: data
    };
    chart.draw(data, chartSupplyOptions);
};


var chartSupplyOptions = {

    backgroundColor: {
        fill: 'transparent',

    },

    vAxis: {
        gridlines: {
            color: 'transparent'
        }
    },

    'width': 300,
    'height': 50,
    // adding vAxis and hAxis like the other chart causes inverted chart area?

    chartArea: {
        left: 2,
        top: 2,
        width: 296,
        height: 46,

    },



    seriesType: "steppedArea", // or bar charts ?
    series: {
        0: {
            type: "line",
            targetAxisIndex: 1,
            pointSize: 5,
        },
        1: {
            color: orangeHex // orange
        },
        2: { // flip
            type: "line",
            targetAxisIndex: 1,
            lineWidth: 0,
            intervals: {
                barWidth: '1',
                lineWidth: 2
            }



        },



    },



    bar: {
        groupWidth: '80%' // removes spacing
    }

};


function getPriceTooltipString(price, order, isBuy) {
    // TODO condense stock (100m+)
    var priceLabel = ((isBuy) ? "Buy: " : "Sell: ");
    return priceLabel + price + "\nOrders: " + order;
};



// note that these offers are array of offer objs!	
function updateSupplyChart(itemId, buyOffers, sellOffers) {
    var chartObj = listSupplyCharts[itemId];
    var chart = chartObj["chart"];
    var data = chartObj["data"];


    // 	delete old data
    data.removeRows(0, data.getNumberOfRows());
    var isRescaled = itemIdOptions[itemId]['rescale'];

    loadOfferRows(data, buyOffers, true, isRescaled);

    if (sellOffers.length > 0 && buyOffers.length > 0) {
        // change color base on flip price



        loadFlipRow(data, buyOffers[0]["unit_price"], sellOffers[0]["unit_price"]);
    }

    loadOfferRows(data, sellOffers, false, isRescaled);

    chart.draw(data, chartSupplyOptions);

};

function loadFlipRow(dataArray, buy, sell) {
    var flipProfit = calculateFlipProfit(buy, sell);
    changeFlipColor(flipProfit["profit"]);
    var tooltip = "Listing Fee: " + flipProfit["listing"] +
        "\nExchange Fee: " + flipProfit["exchange"] + "\nProfit: " + flipProfit["profit"];
    var row = ['flip', null, null, null, null, null, (buy + sell) / 2, buy, sell, tooltip];
    dataArray.addRow(row);
}

function loadOfferRows(dataArray, offers, isBuy, isRescaled) {
    var rowsToAdd = [];
    var maxIndex = Math.min(5, offers.length);
    var label = ((isBuy) ? "b" : "s");



    for (var i = 0; i < maxIndex; i++) {
        var num = ((isBuy) ? maxIndex - i - 1 : i);
        var price = offers[i]["unit_price"];
        var stocks = offers[i]["quantity"];

        // tooltip has to be generated before possible log
        var tooltip = getPriceTooltipString(price, stocks, isBuy);

        if (isRescaled) {
            stocks = Math.log(stocks + 1);
        }

        if (isBuy) {
            rowsToAdd[num] = ([label + i, price, tooltip, 'color:' + blueHex, stocks, tooltip, null, null, null, null]);
        } else {
            rowsToAdd[num] = ([label + i, price, tooltip, 'color: ' + redHex, stocks, tooltip, null, null, null, null]);
        }



    }
    dataArray.addRows(rowsToAdd);
};

function calculateFlipProfit(buyOffer, sellOffer) {
    var difference = sellOffer - buyOffer;
    var listing = Math.max(Math.round(sellOffer * 0.05), 1);
    var exchange = Math.max(Math.round(sellOffer * 0.1), 1);
    var profit = difference - listing - exchange;
    return {
        listing: listing,
        exchange: exchange,
        profit: profit
    };
};

function changeFlipColor(flipProfit) {
    if (flipProfit > 0) {
        // green
        chartSupplyOptions["series"][2]["color"] = greenHex;

    } else {
        chartSupplyOptions["series"][2]["color"] = redHex;

    }
};
/////////////////



// should only need to run once per new watched item and if obj isnt passed ie on reload
// only creates one item, make a different method that loads multiple ids on start
function updateItemData(searchItemIDs) {
    searchItemIDs = encodeURIComponent(searchItemIDs);
    var names = "https://api.guildwars2.com/v2/items?ids=" + searchItemIDs;
    // not sure if need concurncy control. REVIEW when completely merged with the search window
    // apparently js is always single threaded
    $.getJSON(names).done(function(data) {
        parseObjsAndUpdate(data);

    });

};

function parseObjsAndUpdate(itemObj) {
    itemIds = [];
    $.each(itemObj, function(i, item) {

        var itemName = item.name;
        var img = item.icon;
        var itemId = item.id;
        itemIds.push(itemId);
        var rarity = item.rarity;
        var level = item.level;
        createWatchItem(itemId, itemName, rarity, img, level);
    });

    // should only update the items added in
    updateItemPrices(itemIds, true, true);
};

// Update data assumes that there is at least one item already
// item id are stored in array and are valid tp
// only update prices
function updateItemPrices(itemIds, refreshHist, refreshSupply) {
    if (typeof itemIds === 'undefined') {
        itemIds = listWatchItemId;
    }

    if (typeof refreshHist === 'undefined') {
        refreshHist = true;
    }
    if (typeof refreshSupply === 'undefined') {
        refreshSupply = true;
    }
    // note use the ids param
    //defensive
    if (itemIds.length > 0) {

        if (refreshHist) {
            queryHistData(itemIds);
        }
        if (refreshSupply) {
            querySupplyData(itemIds);
        }


    }

};

function queryHistData(itemIds) {
    var prices = "https://api.guildwars2.com/v2/commerce/prices?ids=" + itemIds.join();

    $.getJSON(prices).done(function(data) {

        $.each(data, function(i, item) {

            var sells = item.sells.unit_price;
            var buys = item.buys.unit_price;
            var itemId = item.id;


            addHistDataPoint(itemId, buys, sells);

            updatePriceHelper(itemId, buys, "buy");
            updatePriceHelper(itemId, sells, "sell");

        });
    });

};

function querySupplyData(itemIds) {
    var listings = "https://api.guildwars2.com/v2/commerce/listings?ids=" + itemIds.join();

    $.getJSON(listings).done(function(data) {

        $.each(data, function(i, item) {

            var sells = item.sells;
            var buys = item.buys;
            var itemId = item.id;
            updateSupplyChart(itemId, buys, sells);


        });
    });
};

function updatePriceHelper(itemId, price, buySell) {
    var gold = (price - (price % 10000)) / 10000;
    var silver = (price % 10000 - (price % 100)) / 100;
    var copper = price % 100;
    $("#" + itemId + "-" + buySell + "Copper").text(copper);

    if (silver > 0 || gold > 0) {
        if (gold > 0) {
            $("#" + itemId + "-" + buySell + "Gold").text(gold);
            $("#" + itemId + "-" + buySell + "GoldIcon").show();

        } else {
            $("#" + itemId + "-" + buySell + "Gold").empty();
            $("#" + itemId + "-" + buySell + "GoldIcon").hide();
        }
        $("#" + itemId + "-" + buySell + "Silver").text(silver);
        $("#" + itemId + "-" + buySell + "SilverIcon").show();
    } else {
        $("#" + itemId + "-" + buySell + "Gold").empty();
        $("#" + itemId + "-" + buySell + "Silver").empty();
        $("#" + itemId + "-" + buySell + "GoldIcon").hide();
        $("#" + itemId + "-" + buySell + "SilverIcon").hide();
    }
};

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


    var removeButton = $(document.createElement('button'));
    removeButton.addClass("item-button item-remove");

    var removeIcon = $(document.createElement('i'));
    removeIcon.addClass("fa fa-times  icon ");
    removeButton.append(removeIcon);
    removeButton.click(
        function() {
            removeItem(itemId);
        });

    var optionButton = $(document.createElement('button'));
    optionButton.addClass("item-button item-option");


    var optionIcon = $(document.createElement('i'));
    optionIcon.addClass("fa fa-lg fa-caret-down icon ");
    optionButton.append(optionIcon);

    //graph checkbox option
    var optionContainer = createGraphCheckbox(itemId);


    function optionToggle(button, container) {
        container.fadeToggle(200, 'linear');
        optionIcon.toggleClass('fa-caret-down fa-caret-up');
    };

    optionButton.click(
        function() {
            optionToggle(optionButton, optionContainer);
        });



    var priceContainer = $(document.createElement('div'));

    var graphContainer = $(document.createElement('div'));
    graphContainer.addClass('graph-buysell');

    var histChartDiv = $(document.createElement('div'));
    histChartDiv.addClass("chart-div");
    histChartDiv.attr('id', "hist-chart-" + itemId);
    if (!itemIdOptions[itemId]["historical"]) {
        histChartDiv.hide();
    }

    drawHistChart($(histChartDiv)[0], itemId);

    graphContainer.append(histChartDiv);

    var supplyChartDiv = $(document.createElement('div'));
    supplyChartDiv.addClass("chart-div ");
    supplyChartDiv.attr('id', "supply-chart-" + itemId);
    if (!itemIdOptions[itemId]["stock"]) {
        supplyChartDiv.hide();
    }

    drawSupplyChart($(supplyChartDiv)[0], itemId);

    graphContainer.append(supplyChartDiv);

    var priceDiv = $(document.createElement('div'));



    var buyElem = createPriceElement(itemId, "buy");
    var sellElem = createPriceElement(itemId, "sell");
    priceDiv.append(buyElem, sellElem);



    priceContainer.append(priceDiv, graphContainer);

    var result = cellDiv.append(iconImg, itemName, optionButton, removeButton, optionContainer, priceContainer);


    $(result).appendTo("#main-container");

};

function createGraphCheckbox(itemId) {
    var form = $(document.createElement('form'));
    form.hide();
    form.prop('id', 'form-' + itemId);

    var formGroup = $(document.createElement('div'));
    formGroup.append(createCheckBox(itemId, false, "Historical Graph", "historical"));
    formGroup.append(createCheckBox(itemId, false, "Stock Graph", "stock"));
    formGroup.append(createCheckBox(itemId, true, "Rescale Bars", "rescale"));
    form.append(formGroup);
    return form;
};

function createCheckBox(itemId, isSubBox, text, optionId) {
    var isChecked = itemIdOptions[itemId][optionId];

    var checkboxDiv = $(document.createElement('div'));
    checkboxDiv.addClass('checkbox-div');
    if (isSubBox) {
        checkboxDiv.addClass('sub-checkbox');

    }
    var label = $(document.createElement('label'));
    var input = $(document.createElement('input'));
    var span = $(document.createElement('span'));

    label.attr('for', itemId + "-" + optionId + "-cb");

    input.attr('type', 'checkbox');
    input.attr('id', itemId + "-" + optionId + "-cb");
    input.prop('checked', isChecked);
    input.change(function() {

        // apply changes

        // save changes to local storage

        var checkEvent = input.is(':checked');
        itemIdOptions[itemId][optionId] = checkEvent;
        saveItemOptions();
        if (optionId === "historical") {

            if (checkEvent) {
                $('#hist-chart-' + itemId).show();
            } else {
                $('#hist-chart-' + itemId).hide();
            }


        } else if (optionId === "stock") {
            if (checkEvent) {
                $('#supply-chart-' + itemId).show();
            } else {
                $('#supply-chart-' + itemId).hide();
            }
        } else if (optionId === "rescale") {
            // redraw particular graph
            updateItemPrices([itemId], false, true);
        }

    });

    label.append(span, text);
    checkboxDiv.append(input, label);
    return checkboxDiv;
};

function createPriceElement(itemId, buySell) {
    var label = "Sell:";
    if (buySell == "buy") {
        label = "Buy:"
    }
    var pullRightPrices = $(document.createElement('div')).addClass('pull-right');

    var buyElem = $(document.createElement('div')).text(label);
    buyElem.addClass('buy-sell');
    if (buySell == "sell") {
        buyElem.addClass('pull-right');

    }
    buyElem.append(pullRightPrices);

    var buyGold = $(document.createElement('span'));
    $(buyGold).attr("id", itemId + "-" + buySell + "Gold");

    var buySilver = $(document.createElement('span'));

    $(buySilver).attr("id", itemId + "-" + buySell + "Silver");

    var buyCopper = $(document.createElement('span')).text("0");
    $(buyCopper).attr("id", itemId + "-" + buySell + "Copper");

    var goldImage = $(document.createElement('img')).attr('src', 'image/Gold_coin.png').attr("id", itemId + "-" + buySell + "GoldIcon");

    var silverImage = $(document.createElement('img')).attr('src', 'image/Silver_coin.png').attr("id", itemId + "-" + buySell + "SilverIcon");

    var copperImage = $(document.createElement('img')).attr('src', 'image/Copper_coin.png').attr("id", itemId + "-" + buySell + "CopperIcon");

    $([goldImage, silverImage, copperImage]).each(function(i, value) {
        value.addClass("coin-align");
    });


    $(goldImage, silverImage).hide();


    pullRightPrices.append(buyGold, goldImage, buySilver, silverImage, buyCopper, copperImage);

    return buyElem;
};

// check if there are any existing watched items
// reload them
// then turn on timer

$(document).ready(function() {

    changeFrequency();

    reloadItemListState();
    reloadTransparency();



    var log = Loggr.logs.get("dj_dw2_tp_watcher", "b439775d62ba4852b14520fa2618a81b");
    log.events.createEvent()
        .text("app launched")
        .tags("gw2tpwatcher")
        .post();


});



var frequencyInterval;
var frequency;

function changeFrequency() {
    frequency = defaultFrequency;
    var f = window.localStorage.getItem("frequency");
    if (f) {

        frequency = f;

    }

    if (frequencyInterval) {
        window.clearInterval(frequencyInterval);
    }


    frequencyInterval = setInterval(

        function() {

            if (listWatchItemId.length > 0) {
                updateItemPrices(listWatchItemId, true, true);
            }

        }, frequency);

};


function removeItem(itemId) {

    var index = listWatchItemId.indexOf(itemId);
    listWatchItemId.splice(index, 1);
    delete listHistCharts[itemId];
    delete listSupplyCharts[itemId];

    delete itemIdOptions[itemId];

    saveItems();
    $(".mainWindow-item-cell").remove("#window-item-cell-" + itemId);
    if (listWatchItemId.length == 0) {

        $("#no-watch-item").show();
    }
};

// persistences
function saveItems() {

    saveItemList();
    saveItemOptions();


};

function saveItemList() {
    window.localStorage.setItem("item-list-state", JSON.stringify(listWatchItemId));
};

function saveItemOptions() {
    var optionHolder = [];
    // prevent saving lots of nulls;

    for (var i = 0; i < listWatchItemId.length; i++) {
        var item = listWatchItemId[i];
        optionHolder.push({
            id: item,
            options: itemIdOptions[item]
        });

    }

    window.localStorage.setItem("item-options-state", JSON.stringify(optionHolder));
};

function reloadItemListState() {

    var previousItemList = window.localStorage.getItem("item-list-state");
    var tempListWatchItemId = JSON.parse(previousItemList);
    if (tempListWatchItemId && tempListWatchItemId.length > 0) {
        // there was item list before
        listWatchItemId = tempListWatchItemId;

        var previousItemOptions = window.localStorage.getItem("item-options-state");
        var tempItemOptions = JSON.parse(previousItemOptions);

        if (tempItemOptions && tempItemOptions.length > 0) {
            // there was item list before
            for (var i = 0; i < tempItemOptions.length; i++) {
                var id = tempItemOptions[i].id;
                var options = tempItemOptions[i].options;
                itemIdOptions[id] = options;
            }


        }

        // add any missing (update)
        for (var i = 0; i < listWatchItemId.length; i++) {
            var item = listWatchItemId[i];
            if (!itemIdOptions[item]) {
                itemIdOptions[item] = defaultItemOptions();
            }
        }


        updateItemData(tempListWatchItemId);
    } else {
        // show no watch item message
        $("#no-watch-item").show();
    }



};

function defaultItemOptions() {

    return {
        historical: true,
        stock: false,
        rescale: false
    };
};

function onStorageEvent(storageEvent) {

    if (storageEvent.key.indexOf("add-item-") != -1) {
        // check if new
        var obj = JSON.parse(storageEvent.newValue);
        var newId = obj.id;
        if (newId && $.inArray(newId, listWatchItemId) == -1) {
            listWatchItemId.push(newId);
            itemIdOptions[newId] = defaultItemOptions();

            saveItems();

            parseObjsAndUpdate([obj])

        } else {
            // tell search window that the item has already been added
            window.localStorage.setItem("item-exists", obj.name);
        }

        // done with the event
        window.localStorage.removeItem(storageEvent.key);

        // show no watch item message
        $("#no-watch-item").hide();

    } else if (storageEvent.key.indexOf("transparency-alpha") != -1) {


        var alpha = storageEvent.newValue;
        var rgba = 'rgba(' + defaultR + ',' + defaultG + ',' + defaultB + ',' + alpha + ')';
        $('body').css('background-color', rgba);


    } else if (storageEvent.key.indexOf("frequency") != -1) {
        changeFrequency();

    }

};


function reloadTransparency() {

    var trans = window.localStorage.getItem("transparency-alpha");
    if (trans) {
        var alpha = trans;
        var rgba = 'rgba(' + defaultR + ',' + defaultG + ',' + defaultB + ',' + alpha + ')';
        $('body').css('background-color', rgba);
    }


};

window.addEventListener('storage', onStorageEvent);