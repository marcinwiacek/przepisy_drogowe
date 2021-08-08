
$( "#tresc_ul" ).on( "listviewbeforefilter", function ( e, data ) {
	var value = $( data.input ).val();

	var elements = document.getElementsByTagName('ins');
	while (elements.length!=0) {
		elements[0].parentNode.replaceChild(document.createTextNode(elements[0].firstChild.nodeValue), elements[0]);
	}
	if (value!="") {
		var pattern = new RegExp("(?![^<]+>)("+value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/a/g, "[aąĄ]").replace(/c/g, "[cćĆ]").replace(/e/g, "[eęĘ]").replace(/l/g, "[lłŁ]").replace(/n/g, "[nńŃ]").replace(/o/g, "[oóÓ]").replace(/s/g, "[sśŚ]").replace(/z/g, "[zźżŻŹ]")+")", 'ig');
		document.getElementById('tresc_div').innerHTML=document.getElementById('tresc_div').innerHTML.replace(pattern,'<ins style="background-color:yellow;">$1</ins>');
	}
});

document.getElementById('select-choice-1').onchange = tresc_zmien2;
document.getElementById('inne_wybor_opis').onclick = zmienstrona; 
document.getElementById('taryfikator_wybor_opis').onclick = zmienstrona; 
document.getElementById('tresc_wybor_opis').onclick = zmienstrona; 
document.getElementById('znaki_wybor_opis').onclick = zmienstrona; 

tresc_zmien();
