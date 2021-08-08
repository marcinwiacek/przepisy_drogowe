
$(document).bind("mobileinit", function(){
	$.mobile.fixedToolbars.show(true);
	$.mobile.fixedToolbars.setTouchToggleEnabled(false);
});	

function zmienstrona(e) {
	window.location.href=this.id.replace("_wybor_opis","")+'.html';
}

function inne_zmien2(e) {
	$.mobile.showPageLoadingMsg();
	$('input[data-type="search"]').val("");
	inne_zmien();
	$.mobile.hidePageLoadingMsg();	
}

function inne_zmien() {
	nazwa5=document.getElementById('select-choice-2').options[document.getElementById('select-choice-2').selectedIndex].value;
	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'text',
		url: nazwa5,
		success: function(data){
			if (this.url.indexOf('d39.htm')!=-1) {
				if (data.indexOf('\r\n',0)==-1) {
					pos = data.indexOf('\n',0);
					nazwa = data.substr(0,pos);
					pos2 = data.indexOf('\n',pos+1);
					nazwa2 = data.substr(pos+1,pos2-pos-1);
					pos3 = data.indexOf('\n',pos2+1);
					nazwa4 = data.substr(pos3+1).replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=').replace(/<table>/g,'<table width=100%>');
				} else {
					pos = data.indexOf('\r\n',0);
					nazwa = data.substr(0,pos);
					pos2 = data.indexOf('\r\n',pos+1);
					nazwa2 = data.substr(pos+2,pos2-pos-2);
					pos3 = data.indexOf('\r\n',pos2+1);
					nazwa4 = data.substr(pos3+2).replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=').replace(/<table>/g,'<table width=100%>');
				}
				document.getElementById("inne_div").innerHTML="<center><img src=assets/d/d39_big.png></center>"+nazwa4;
			} else {
				document.getElementById("inne_div").innerHTML=data.substring(data.indexOf('<body>')+6).replace('</body>','').replace('</html>','').replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!(\"http|http))/g,' onClick=pokaz_znak(this.id,true); href=# id=');
			}
		}
	});
}
