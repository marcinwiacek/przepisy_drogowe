
$(document).bind("mobileinit", function(){
	$.mobile.fixedToolbars.show(true);
	$.mobile.fixedToolbars.setTouchToggleEnabled(false);
});	

function zmienstrona(e) {
	window.location.href=this.id.replace("_wybor_opis","")+'.html';
}

function tresc_zmien2() {
	$.mobile.loading('show');

	$('input[data-type="search"]').val("");
	tresc_zmien();
	$.mobile.silentScroll(0);
	$.mobile.loading('hide');
}

function tresc_zmien() {
	nazwa5=document.getElementById('select-choice-1').options[document.getElementById('select-choice-1').selectedIndex].value;
	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'html',
		url: nazwa5,
		success: function(data){
			document.getElementById("tresc_div").innerHTML=data.substring(data.indexOf('<body>')+6).replace('</body>','').replace('</html>','').replace(/href=\"#/g,' onClick=$.mobile.silentScroll(document.anchors[this.id].offsetTop); href=# id=\"');
		}
	});
}

