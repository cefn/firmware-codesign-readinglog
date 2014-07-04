import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";

import module namespace uri = "http://zorba.io/modules/uri";
import module namespace file = "http://expath.org/ns/file";

declare default element namespace "http://www.w3.org/1999/xhtml"; 

let $refdir := '/home/cefn/Documents/highwire/participatory firmware design/readinglog/notes/' 
return 
template:webpage(
	<div>
		{for $heading in notes:allnotes()//h1 let $datetime := file:last-modified(concat($refdir,file:base-name(uri:decode(document-uri(root($heading)))))) order by $datetime descending return <p><em>{string($heading)} {format-date(xs:date($datetime), "[D1o] [MNn], [Y]", "en", (), ())}</em> {notes:paperlinks($heading)}</p>}
	</div>
)