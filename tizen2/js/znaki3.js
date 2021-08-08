
typ="";
nr=1;
for (i=0;i<nazwy.length;i++) {
	typ2=typ_znaku(nazwy[i][0]);
	if (typ2!=typ) {
		var option = document.createElement('option');
		option.setAttribute('value', nr);
		option.innerHTML = typ2;
		document.getElementById("select-choice-4").appendChild(option);
			
		nr++;
		typ=typ2;
	}
}

$('[data-role="page"]').bind ("pageshow", function (event, ui) {		
 	if (ui.prevPage && ui.prevPage[0] && ui.prevPage[0].id=='opis_znaku') {
		$.mobile.silentScroll(ostatniastrona_top.pop());
	}				
});

document.getElementById('select-choice-4').onchange = znaki_zmien2;
document.getElementById('back_btn').onclick = powrot; 
document.getElementById('ready_btn').onclick = menu; 
document.getElementById('inne_wybor_opis').onclick = zmienstrona; 
document.getElementById('taryfikator_wybor_opis').onclick = zmienstrona; 
document.getElementById('tresc_wybor_opis').onclick = zmienstrona; 
document.getElementById('znaki_wybor_opis').onclick = zmienstrona; 

znaki_zmien();
