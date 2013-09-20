import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $match external;

template:webpage(
	<div>
		<p>{$match}</p>
		{for $heading in notes:followingheader(notes:allnotes(),$match)[self::p] return <h3>{string($heading)}</h3>}
	</div>
)
