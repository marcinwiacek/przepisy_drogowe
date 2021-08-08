 <?php

echo "<html><head><meta charset=\"UTF-8\"></head><body>";
       
function replacechars($line) {
	$line2 = preg_replace("/kamiennobetonowych/", "<nobr>kamienno-betonowych</nobr>", $line);
	$line2 = preg_replace("/CelnoSkarbową/", "<nobr>Celno-Skarbową</nobr>", $line2);
	$line2 = preg_replace("/CelnoSkarbowej/", "<nobr>Celno-Skarbowej</nobr>", $line2);
	$line2 = preg_replace("/ratowniczogaśniczych/", "<nobr>ratowniczo-gaśniczych</nobr>", $line2);
	$line2 = preg_replace("/higienicznosanitarne/", "<nobr>higieniczno-sanitarne</nobr>", $line2);
	$line2 = preg_replace("/3dniowych/", "<nobr>3-dniowych</nobr>", $line2);
	$line2 = preg_replace("/143\\) zł/", "<a href=#143><sup>143)</sup></a> zł", $line2);

	$line2 = preg_replace("/500–2300/", "<nobr>5<sup>00</sup>–23<sup>00</sup></nobr>", $line2);
	$line2 = preg_replace("/2300–500/", "<nobr>23<sup>00</sup>–5<sup>00</sup></nobr>", $line2);
	$line2 = preg_replace("/cm2/", "cm<sup>2</sup>", $line2);
	$line2 = preg_replace("/cm3/", "cm<sup>3</sup>", $line2);
	$line2 = preg_replace("/dm3/", "dm<sup>3</sup>", $line2);
	$line2 = preg_replace("/M1/", "M<sub>1</sub>", $line2);
	$line2 = preg_replace("/M2/", "M<sub>2</sub>", $line2);
	$line2 = preg_replace("/M3/", "M<sub>3</sub>", $line2);
	$line2 = preg_replace("/N1/", "N<sub>1</sub>", $line2);
	$line2 = preg_replace("/N2/", "N<sub>2</sub>", $line2);
	$line2 = preg_replace("/N3/", "N<sub>3</sub>", $line2);
	$line2 = preg_replace("/CO2/", "CO<sub>2</sub>", $line2);

	$line2 = preg_replace("/On = pj/", "O<sub>n</sub> = p<sub>j</sub>", $line2);
	$line2 = preg_replace("/× pj,/", "× p<sub>j</sub>,", $line2);
	$line2 = preg_replace("/– On –/", "– O<sub>n</sub> –", $line2);
	$line2 = preg_replace("/– pj –/", "– p<sub>j</sub> –", $line2);


	return $line2; 
}

function linkinside($line,$start) {
	if(preg_match("/[^ 0-9]\d+\\)/", substr($line,$start+1,strlen($line)-$start-1))){
		$line2= preg_replace_callback("|([^ 0-9])(\d+)\\)|",
			function ($m) {return $m[1]."<a href=#".$m[2]."><sup>".$m[2]."</sup></a>";},
			substr($line,$start+1,strlen($line)-$start-1));
		if(preg_match("/^\d+\\)/", $line2)){
			return preg_replace_callback("|^(\d+)\\)|",
				function ($m) {return "<a href=#".$m[1]."><sup>".$m[1]."</sup></a>";},
				$line2);
		}
		return $line2;
	}
	if(preg_match("/^\d+\\)/", substr($line,$start+1,strlen($line)-$start-1))){
		return preg_replace_callback("|^(\d+)\\)|",
			function ($m) {return "<a href=#".$m[1]."><sup>".$m[1]."</sup></a>";},
			substr($line,$start+1,strlen($line)-$start-1));
	}
	return substr($line,$start+1,strlen($line)-$start-1);
}

//prd
$ustawa = "/^Dziennik Ustaw – \d+ – Poz\. 1990/";

//ukp
$ustawa = "/^Dziennik Ustaw – \d+ – Poz\. 341/";

$myfile = fopen("ustawa.txt", "r") or die("Unable to open file!");
$level = 0;
$dzial = 1;
$numer=1;
$ignore=false;
while (!feof($myfile)) {
	$line = fgets($myfile);

	//niektóre replacementy z 1 linii są za dużo
	$line = preg_replace_callback("|([\wąęćłńóśżź])\-([\wąćęłńóśżź])|",function ($m) {return $m[1].$m[2];},$line);
	$line = replacechars($line);

	// "1) "
	if(preg_match("/^\d+\) .*/", $line)){
		if (strpos($line,($numer-1).") (uchylony)")===0) {
			$numer--;
		}
		if (intval($line,10)!=$numer) {
			$ignore=true;
		}
	}
	if(preg_match($ustawa, $line)){
		$ignore=false;
		continue;
	}
	if ($ignore) {
		continue;
	}

	switch ($level) {
	case 0:
		if (strpos($line,"DZIAŁ ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Art. ")===0) {
			echo "<p><b>";

			echo "Art. ";
			$start=0;
			for ($i=5;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					echo "</b>";
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			$numer=1;
			$level=1;
			break;
		}

		echo linkinside($line,-1);
		break;
	case 1: // 1.

		if (strpos($line,"– ")===0) {
			$numer=1;
			echo "<p>–";
			echo linkinside($line,2);

			break;
		}

		if (strpos($line,"Art. ")===0) {
			$numer=1;
			echo "<p><b>";

			echo "Art. ";
			$start=0;
			for ($i=5;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					echo "</b>";
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			$level=1;
			break;
		}

		if (strpos($line,"DZIAŁ ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			echo "<p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}

		// "1. "
		if(preg_match("/^\d+[a-w]*\..*/", $line)){
			$numer=1;
			echo "<p>";
			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);
			break;
		}

		// "1) "
		if(preg_match("/^\d+[a-w]*\).*.*/", $line)){
			$numer = intval($line,10)+1;
			echo "<p>";
			echo "<div style=\"margin-left:30px\">";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			$level=2;
			break;
		}

		echo linkinside($line,-1);
		break;
	case 2: //1) 

		if (strpos($line,"„")===0) {
			echo "<p>„";
			echo linkinside($line,2);

			break;
		}

		if (strpos($line,"– ")===0) {
			echo "</div>";
			echo "<p>–";
			echo linkinside($line,2);
			echo "<div style=\"margin-left:30px\">";

			break;
		}

		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			echo "</div>";
			echo "<p><b>";

			echo "Art. ";
			$start=0;
			for ($i=5;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					echo "</b>";
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			echo "</div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			echo "</div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			echo "</div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}

		// "1. "
		if(preg_match("/^\d+[a-w]*\..*/", $line)){
			echo "</div>";
			echo "<p>";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			$numer=1;
			$level=1;
			break;
		}
		// "a) "
		if(preg_match("/^[a-w]+\).*.*/", $line)){
			$level=3;
			echo "<p>";
			echo "<div style=\"margin-left:30px\">";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).*.*/", $line)){
			$numer = intval($line,10)+1;
                     	
			echo "<p>";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			break;
		}

		echo linkinside($line,-1);
		break;
	case 3: // "a) "

		// – 
		if (strpos($line,"– ")===0) {
			$level=4;
			echo "<div style=\"margin-left:30px\">";
			echo "<p>–";

			echo linkinside($line,2);

			break;
		}		
		// "a) "
		if(preg_match("/^[a-w]+\).*.*/", $line)){
			echo "<p>";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).*.*/", $line)){
			$level=2;
			$numer = intval($line,10)+1;
			echo "</div><p>";

			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);


			break;
		}
		// "1. "
		if(preg_match("/^\d+[a-w]*\..*/", $line)){
			echo "</div></div><p>";


			$start=0;
			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			echo "</div></div>";
			echo "<p><b>";

			echo "Art. ";
			$start=0;
			for ($i=5;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					echo "</b>";
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			echo "</div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			echo "</div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			echo "</div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}

		echo linkinside($line,-1);
		break;

	case 4: // -

		// – 
		if (strpos($line,"– ")===0) {
			echo "<p>–";

			echo linkinside($line,2);
			break;
		}
		// "a) "
		if(preg_match("/^[a-w]+\).*.*/", $line)){
			echo "</div><p>";

			$level=3;
			$start=0;

			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);

			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).*.*/", $line)){
			$level=2;
			$numer = intval($line,10)+1;
			echo "</div></div><p>";

			$start=0;

			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]===')') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);


			break;
		}
		// "1. "
		if(preg_match("/^\d+[a-w]*\..*/", $line)){
			echo "</div></div></div><p>";

			$start=0;

			for($i=0;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					$start=$i;
					break;
				}
			}

			echo linkinside($line,$start);


			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			echo "</div></div></div>";
			echo "<p><b>";

			echo "Art. ";
			$start=0;
			for ($i=5;$i<strlen($line);$i++) {
				echo $line[$i];
				if ($line[$i]==='.') {
					echo "</b>";
					$start=$i;
					break;
				}
			}
			echo linkinside($line,$start);

			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			echo "</div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			echo "</div></div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			echo "</div></div></div><p><div id=\"bok",$dzial,"\"></div><center>",$line;
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			echo "<br><b>",$line,"</b></center>";
			break;
		}

		echo linkinside($line,-1);
		break;

	default:
	        echo $line;
		break;
	}
}
fclose($myfile);

for($i=$level-1;$i>0;$i--) echo "</div>";

echo "<hr>";

$myfile = fopen("ustawa.txt", "r") or die("Unable to open file!");
$level = 0;
$dzial = 1;
$numer=1;
$ignore=false;
$numerprzypisu=1;
$doubleignore=false;
while (!feof($myfile)) {
	$line = fgets($myfile);
	$line = preg_replace_callback("|([\wąęćłńóśżź])\-([\wąćęłńóśżź])|",function ($m) {return $m[1].$m[2];},$line);

	// "1) "
	if(preg_match("/^\d+\) .*/", $line)){
		if (intval($line,10)!=$numer) {
			$ignore=true;
			$doubleignore=false;
		}
	}
	if(preg_match($ustawa, $line)){
		$ignore=false;
		continue;
	}
	if ($ignore) {
		if (intval($line,10)===$numerprzypisu) {
			$doubleignore=true;
			continue;
		}
		if ($doubleignore) {
			echo $line;
			continue;
		}
		if (intval($line,10)===$numerprzypisu+1) {
			$numerprzypisu++;
			echo "<p><a name=\"",$numerprzypisu,"\"></a><sup>",$numerprzypisu,")</sup>";
			for($i=strlen((string)$numerprzypisu)+2;$i<strlen($line);$i++) {
				echo $line[$i];
			}
			continue;
		}
		continue;
	}

	switch ($level) {
	case 0:
		if (strpos($line,"DZIAŁ ")===0) {
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			break;
		}

		break;
	case 1: // 1.

		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			break;
		}

		// "1. "
		if(preg_match("/^\d+[a-w]*\. .*/", $line)){
			$numer = 1;
			break;
		}

		// "1) "
		if(preg_match("/^\d+[a-w]*\).* .*/", $line)){
			$numer = intval($line,10)+1;
			$level=2;
			break;
		}
		break;
	case 2: //1) 

		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}

		// "1. "
		if(preg_match("/^\d+[a-w]*\. .*/", $line)){
			$numer=1;
			$level=1;
			break;
		}
		// "a) "
		if(preg_match("/^[a-w]+\).* .*/", $line)){
			$level=3;
			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).* .*/", $line)){
			$numer = intval($line,10)+1;
			break;
		}
		break;
	case 3: // "a) "

		// – 
		if (strpos($line,"– ")===0) {
			$level=4;
			break;
		}		
		// "a) "
		if(preg_match("/^[a-w]+\).* .*/", $line)){
			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).* .*/", $line)){
			$level=2;
			$numer = intval($line,10)+1;
			break;
		}
		// "1. "
		if(preg_match("/^\d+[a-w]*\. .*/", $line)){
			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}

		break;

	case 4: // -

		// – 
		if (strpos($line,"– ")===0) {
			break;
		}
		// "a) "
		if(preg_match("/^[a-w]+\).* .*/", $line)){
			break;
		}
		// "1) "
		if(preg_match("/^\d+[a-w]*\).* .*/", $line)){
			$level=2;
			$numer = intval($line,10)+1;
			break;
		}
		// "1. "
		if(preg_match("/^\d+[a-w]*\. .*/", $line)){
			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"Art. ")===0) {
			$numer=1;
			$level=1;
			break;
		}
		if (strpos($line,"DZIAŁ ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Rozdział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		if (strpos($line,"Oddział ")===0) {
			$level=0;
			$dzial++;
			$line = fgets($myfile);
			break;
		}
		break;

	default:
		break;
	}
}
fclose($myfile);

echo "</body></html>";

?> 
