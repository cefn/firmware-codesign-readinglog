import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $match external;

template:webpage(
	<div>
		<h1>{$match}</h1>
		{for $heading in notes:notesoftype($match)[self::p][text()] (: consider only non-empty paragraphs:)
			return 
				<p>
					{string($heading)}
					{notes:paperlinks($heading)}
				</p>
		}
	</div>
)
