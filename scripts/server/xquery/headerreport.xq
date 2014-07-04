import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

let $headers := notes:allnotes()//h2[contains(text(),"Authors")],
	$headertexts := $headers/text()
return template:webpage(
	<table>
		{
			for $result in distinct-values($headertexts) return <div>
				<h1>{$result}</h1>
				<p>{count($headers[text()=$result])}</p>
			</div>
		}
	</table>

)