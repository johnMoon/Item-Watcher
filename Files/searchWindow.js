function pressedEnter(e){
		e = e || window.event;
      if(e.keyCode == 13) {
         setTimeout(displayMatchingSets,2000);
		 document.getElementById("log").innerHTML+="you've pressed Enter, you will be redirected to displayMatchingsets.. <br />"
      }
}


function displayMatchingSets(){
		
	//document.getElementById("log").innerHTML+= "displayMatchingSets() is called!"

 $('#searchResult').empty();
 
var searchItemIDs = document.getElementById("search").value.replace("/", " ").trim();
searchItemIDs =encodeURIComponent(searchItemIDs);

var prices = "https://api.guildwars2.com/v2/commerce/prices/" + searchItemIDs ;

var names = "https://api.guildwars2.com/v2/items/" + searchItemIDs;


if(searchItemIDs){

$.getJSON(prices, function(data){
	alert("sucess!!");
	console.log(data);
	console.log(data.id);
	console.log(data.sells.unit_price);
	console.log(data.buys);
	//console.log();
	//console.log();
	//console.log();
	//console.log();
	//console.log();
	








}).done( function (data) {
			var sells = data.sells.unit_price;
			var buys = data.buys.unit_price; 
			var itemName;
			var img ;
			
			$.getJSON(names , function(data){
				alert("getting names success");
				console.log(data);
			
			
			
			}).done(function (data){
				 itemName = data.name; 
				 img = data.icon;
			 
			createSearchItem(itemName,img,buys,sells);
			 
			 
			});
			
			
			
			

			$.each(data.results, function (i, item) {
					

							createSearchItem(i, item.img,  item.name);
			
									});







});
















}








}


function createSearchItem(name,image,bPrice,sPrice){
			
	//var li = $(document.createElement('li'));
	 var table = $(document.createElement('table'));
	 $(table).addClass("watch-header");
	 var img = $(document.createElement('img')).attr('src', image);
	 $(img).attr('height', "32").attr('width',"32");
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
	
	$(td5).attr('rowspan',"2").attr('align',"center").addClass("graph");
	var div = $(document.createElement('div'));
	
	$(div).attr('id',"curve_chart").attr('style',"width: 180x; height: 32px");
	td5.append($(div));
	tr3.append($(td5));
	
	var td6 = $(document.createElement('td')); 
	 $(td6).addClass("buy")
		td6.append("buy");
	
		tr3.append($(td6));
		
	var td7 = $(document.createElement('td')); 
		$(td7).addClass("buying-price");
			var span2 = $(document.createElement('span')).text(bPrice);
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
		 td9.append(span3);
		 
		 tr4.append(td9);
		 
		 table2.append($(tr4));
		 
		result.append($(table2));
		 $(result).appendTo("#searchResult");
		 
		 
		   $(searchResult).ready(
            function() {
                setInterval(function() {
                    var randomnumber = Math.floor(Math.random() * 100);
                    $('#show').text(
                            'I am getting refreshed every 3 seconds..! Random Number ==> '
                                    + randomnumber);
                }, 3000);
            });
	 
	//$(li).attr('id', "item-cell-"+index).addClass("search-item-cell" );
	//var img = $(document.createElement('img')).attr('src', imageSrc);
	//$(img).attr('height', "32").attr('width', "32");
	//$(img).addClass("item-img");
	//var span = $(document.createElement('span')).text(itemName);
	//span.addClass("item-name" );
	//var button = $(document.createElement('button')).text("X");
	//button.addClass( "right-button" );

	//var result = $(li).append($(img));
	//result = $(li).append($(span));
	//result = $(li).append($(button));
	//$(result).appendTo("#searchResult");

}