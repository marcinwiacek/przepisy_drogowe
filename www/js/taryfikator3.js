
$('[data-role="page"]').bind ("pageshow", function (event, ui) {		
 	if (ui.prevPage && ui.prevPage[0] && ui.prevPage[0].id=='opis_znaku') {
		$.mobile.silentScroll(ostatniastrona_top.pop());
	}				
});

document.getElementById('select-choice-3').onchange = taryfikator_zmien2;
document.getElementById('back_btn').onclick = powrot; 
document.getElementById('ready_btn').onclick = menu; 
document.getElementById('inne_wybor_opis').onclick = zmienstrona; 
document.getElementById('taryfikator_wybor_opis').onclick = zmienstrona; 
document.getElementById('tresc_wybor_opis').onclick = zmienstrona; 
document.getElementById('znaki_wybor_opis').onclick = zmienstrona; 

taryfikator_zmien();
