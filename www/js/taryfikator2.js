
$(document).bind("mobileinit", function(){
	$.mobile.fixedToolbars.show(true);
	$.mobile.fixedToolbars.setTouchToggleEnabled(false);
});	

function zmienstrona(e) {
	window.location.href=this.id.replace("_wybor_opis","")+'.html';
}

function nazwa_ustawy(s) {
	return s.replace(/c.p.g./g,'USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach').replace(/k.k./g,'USTAWY z dnia 6 czerwca 1997 Kodeks Karny').replace(/k.w./g,'USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń').replace(/o.o.z.r./g,'ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach').replace(/p.r.d./g,'USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym').replace(/u.d.p./g,'USTAWY z dnia 21 marca 1985 r. o drogach publicznych').replace(/z.s.d./g,'ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych').replace(/u.t.d./g,"USTAWY z dnia 6 września 2001 r. o transporcie drogowym").replace(/h.p.s./g,"Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85").replace(/aetr/g,"Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r.").replace(/r.u.j./g,"Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym").replace(/u.s.t.c/g,"USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych");
}

lista2 = new Array();

function taryfikator_doczytaj2(url) {
	for (i=0;i<lista2.length;i++) {
		if (lista2[i][0]==url) {
			return;
		}
	}

	lista3 = new Array();

	lista3.push(url);
	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'json',
		url: 'assets/kary/'+url+'.jso',
		success: function(data){
		  	$.each(data.m, function(key, val) {
				lista4 = new Array();
				lista4.push(val.o);
				lista4.push(val.w);
				lista4.push(val.s);
				lista3.push(lista4);
			});	
		}
	});

	lista2.push(lista3);
}

function taryfikator_zmien2() {
	$.mobile.loading('show');

	$('#taryfikator_div').hide();
	document.getElementById("taryfikator_ul").innerHTML="";
	$('input[data-type="search"]').val("");
	taryfikator_zmien();
	$('#taryfikator_ul').listview('refresh');
	$.mobile.silentScroll(0);		
	$('#taryfikator_div').show();

	$.mobile.loading('hide');

}

function taryfikator_zmien() {
	nazwa5=document.getElementById('select-choice-3').options[document.getElementById('select-choice-3').selectedIndex].value;
	if (nazwa5=="1" || nazwa5=="2") {
		taryfikator_doczytaj2('20110524');
		taryfikator_doczytaj2('20120609');
		taryfikator_doczytaj2('20101231');
	} else if (nazwa5=="3") {
		taryfikator_doczytaj2('20110524');
		taryfikator_doczytaj2('20120609');
	} else {
		taryfikator_doczytaj2('20110524');
		taryfikator_doczytaj2('20101231');
	}
	if (nazwa5=="1" || nazwa5=="2") {
		$.ajax({
			async: false,
			type: 'GET',
			dataType: 'json',
			url: 'assets/kary/y.jso',
			success: function(data){
			  	$.each(data.m, function(key, val) {
					var li = document.createElement('li');
					li.setAttribute('data-role', 'list-divider');
					li.innerHTML=val.o;
					document.getElementById("taryfikator_ul").appendChild(li);
				  	$.each(val.m, function(key2, val2) {
						var li = document.createElement('li');
						li.innerHTML="<b>"+val2.o.replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=')+"</b>";
						if (nazwa5=="2") {
							prev='';
						  	$.each(val2.h, function(key3, val3) {
								if (prev=='' || val3.m==prev) {
									li.innerHTML=li.innerHTML+"<br>"+val3.t;
									prev = val3.m;
								}
							});	
						} else {
							prev='';
						  	$.each(val2.h, function(key3, val3) {
								if (val3.m=='20101231' && prev=='20110524') {
								} else {
									li.innerHTML=li.innerHTML+"<br>"+val3.m+": "+val3.t;
								}
								prev = val3.m;
								if (val3.w == 'k.w.') {
									li.innerHTML=li.innerHTML+"<br><div style=margin-left:30px>"+nazwa_ustawy('k.w.')+"</div>";
								} else {
									for (i=0;i<lista2.length;i++) {
										if (lista2[i][0]!=val3.m) {
											continue;
										}
										for (j=1;j<lista2[i].length;j++) {
											if (lista2[i][j][2].indexOf(val3.w)!=0) {
												continue;
											}
											li.innerHTML=li.innerHTML+"<br><div style=margin-left:30px>"+lista2[i][j][0].replace(/<table><tr><td>/g,'').replace(/<\u002ftd><\u002ftr><\u002ftable>/g,'').replace(/<\u002ftd><\u002ftr><tr><td>/g,', ').replace(/align\u003dleft/g,'align\u003dmiddle').replace(/width=50/g,'width=0').replace(/height=100/g,'height=0')+": "+lista2[i][j][1]+"; "+nazwa_ustawy(lista2[i][j][2])+"</div>";
											break;
										}
										break;
									}
								}
							});	
						}
						
						li.setAttribute('style', 'white-space:normal');
						document.getElementById("taryfikator_ul").appendChild(li);
					});	
				});	
			}
		});
	} else {
		lista = new Array();
		for (i=0;i<lista2.length;i++) {
			if (nazwa5=="3") {
				if (lista2[i][0]=='20101231') {
					continue;
				}
			} else {
				if (lista2[i][0]=='20120609') {
					continue;
				}
			}

			for (var j = 1; j < lista2[i].length; j++){
				var lista5 = new Array();
				lista5.push(lista2[i][j][0]);
				lista5.push(lista2[i][j][1]);
				lista5.push(lista2[i][j][2]);

				added=false;
				for (var z = 0; z < lista.length; z++){
					if (lista[z][0].localeCompare(lista2[i][j][0])!=0) {
						continue;
					}
					lista.splice(z+1,0,lista5);
					added=true;
					break;
				}
				if (!added) {
					lista.push(lista5);
				}
			}
		}

		lista.sort(function(a,b){return a[0].localeCompare(b[0])});

		if (lista.length!=0) {
			s = "<b>"+lista[0][0].replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=')+
					"</b><br>"+lista[0][1]+"; "+nazwa_ustawy(lista[0][2]);
			for (var i = 1; i < lista.length; i++){
				if (lista[i][0].localeCompare(lista[i-1][0])==0) {
					s1=lista[i][1]+"; "+nazwa_ustawy(lista[i][2]);
					if (s.indexOf(s1)==-1) {
						s=s+"<br><br>"+s1;
					}
				} else {
					var li = document.createElement('li');
					li.innerHTML=s;
					document.getElementById("taryfikator_ul").appendChild(li);
	
					s = "<b>"+lista[i][0].replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=')+
					"</b><br>"+lista[i][1]+"; "+nazwa_ustawy(lista[i][2]);
				}
			}
			if (s!="") {
				var li = document.createElement('li');
				li.innerHTML=s;
				document.getElementById("taryfikator_ul").appendChild(li);
			}
		}
	}
}
