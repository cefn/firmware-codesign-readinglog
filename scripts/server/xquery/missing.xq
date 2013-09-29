import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $type external;

template:webpage(
	<div>
		{for $heading in notes:allnotes()//h1[not(root()//*[notes:filterbytype(.,$type)])] return <p><em>{string($heading)}</em> {notes:paperlinks($heading)}</p>}
	</div>
)