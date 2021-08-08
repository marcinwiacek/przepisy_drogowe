
function x( text, searchValue, item ){
	return text.toString().toLowerCase().replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z').indexOf( searchValue.replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z') ) === -1;
};

$(document).bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn= false;
	$.mobile.listview.prototype.options.filterCallback = x;
});
