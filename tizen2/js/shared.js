
ostatniastrona_url=new Array();
ostatniastrona_top=new Array();

function powrot() {
	ostatniastrona_url.pop();
	if (ostatniastrona_url.length==1) {
		$.mobile.changePage('#'+ostatniastrona_url.pop(),{changeHash:false});
	} else {
		x=ostatniastrona_url.pop();
		ostatniastrona_url.push(x);
		pokaz_znak(x,false);
	}
}
function menu() {
	while (ostatniastrona_url.length!=1) {
		ostatniastrona_url.pop();
	}
	while (ostatniastrona_top.length!=1) {
		ostatniastrona_top.pop();	
	}
	$.mobile.changePage('#'+ostatniastrona_url.pop(),{changeHash:false});
}

function pokaz_znak(url,historia) {
	$.mobile.showPageLoadingMsg();

	cosik=url;
	if (historia) {
		ostatniastrona_top.push(window.pageYOffset);
		if (ostatniastrona_url.length==0) {
			ostatniastrona_url.push($('.ui-page-active').attr('id'));
		} else {
			ostatniastrona_top.push(0);			
		}
		ostatniastrona_url.push(url);
	}
	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'html',
		url: "assets/"+url+".htm",
		success: function(data){
			if (data.indexOf('\r\n',0)==-1) {
				pos = data.indexOf('\n',0);
				nazwa = data.substr(0,pos);
				pos2 = data.indexOf('\n',pos+1);
				nazwa2 = data.substr(pos+1,pos2-pos-1);
				pos3 = data.indexOf('\n',pos2+1);
				nazwa3 = data.substr(pos2+1,pos3-pos2-1);
				nazwa4 = data.substr(pos3+1).replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=').replace(/<table>/g,'<table width=100%>');
			} else {
				pos = data.indexOf('\r\n',0);
				nazwa = data.substr(0,pos);
				pos2 = data.indexOf('\r\n',pos+1);
				nazwa2 = data.substr(pos+2,pos2-pos-2);
				pos3 = data.indexOf('\r\n',pos2+1);
				nazwa3 = data.substr(pos2+2,pos3-pos2-2);
				nazwa4 = data.substr(pos3+2).replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=').replace(/<table>/g,'<table width=100%>');
			}

			nazwa5='';
			if (nazwa3!=' ') {
				$.ajax({
					async: false,
					type: 'GET',
					dataType: 'json',
					url: 'assets/kary/y.jso',
					success: function(data){
					  	$.each(data.m, function(key, val) {
						  	$.each(val.m, function(key2, val2) {
								if (val2.o.indexOf(nazwa3)!=-1) {
									nazwa5=nazwa5+"<tr><td><b>"+val2.o.replace(/src=/g,'src=assets/').replace(/assets\/\"/g,'\"assets/').replace(/href=(?!http)/g,' onClick=pokaz_znak(this.id,true); href=# id=')+"</b>";
	
									prev='';
									$.each(val2.h, function(key3, val3) {
										if (prev=='' || val3.m==prev) {
											nazwa5=nazwa5+"<br>"+val3.t;
											prev = val3.m;
										}
									});	
									nazwa5=nazwa5+"</td></tr>";
								}
							});	
						});	
					}
				});
				if (nazwa5!='') {
					nazwa5="<table width=100%><tr><td bgcolor=grey><font color=white>Taryfikator od 09.06.2012 - wybrane pozycje</font></td></tr>"+nazwa5+"</table>";
				}
			}
			
			document.getElementById("znak_naglowek_div").innerHTML="Znak "+nazwa2;
			document.getElementById("znak_opis_div").innerHTML="<center><b>"+typ_znaku(cosik)+" \""+nazwa+"\"</b><p><img src=assets/"+cosik+".png></center>"+nazwa4+nazwa5;

		}
	});

	$.mobile.hidePageLoadingMsg();
	$.mobile.changePage('#opis_znaku',{changeHash:false,allowSamePageTransition:true});
}


function typ_znaku(cosik) {
	switch (cosik[0]) {
	case 'a': 
        	switch (cosik[1]) {            		
		        case '/':  return "Znak ostrzegawczy"; break;
		        case 't': return "Dodatkowy znak dla kierujących tramwajami"; break;
	        }
		break;
	case 'b':
		switch (cosik[1]) {
		        case '/': return "Znak zakazu"; break;
		        case 't': return "Dodatkowy znak dla kierujących tramwajami"; break;
		}
	        break;
	case 'c': return "Znak nakazu"; break;
	case 'd': return "Znak informacyjny"; break;
	case 'e': return "Znak kierunku i miejscowości"; break;
	case 'f': return "Znak uzupełniający"; break;
	case 'g': return "Dodatkowy znak przed przejazdami kolejowymi"; break;
	case 'i': return "Znak nieformalny"; break;
	case 'p': return "Znak poziomy"; break;
	case 'r': return "Dodatkowy znak szlaków rowerowych"; break;
        case 's': 
		switch (cosik[1]) {            		
	        	case 'b': return "Sygnał świetlny dla kierujących pojazdami wykonującymi odpłatny przewóz na regularnych liniach"; break;
	        	case '/': return "Sygnał świetlny dla kierujących i pieszych"; break;
		}
	        break;
	case 't': return "Tabliczka"; break;
    	case 'w': return "Dodatkowy znak dla kierujących pojazdami wojskowymi"; break;
	}
	return "";
}
