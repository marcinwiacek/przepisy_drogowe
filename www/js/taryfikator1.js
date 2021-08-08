
$(document).bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn= false;

	$.mobile.filterable.prototype.options.filterCallback = function( index, searchValue ) {
		if (document.getElementById("taryfikator_ul").childNodes[index+1].innerHTML.indexOf("<")==-1) return false;
		return ( $.mobile.getAttribute( this, "filtertext" ) || $( this ).text() ).toString().toLowerCase().replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z').indexOf( searchValue.replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z') ) === -1;	
	}
});
