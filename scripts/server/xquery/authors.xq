import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

(: Defines the set of text nodes matching the requested string:)
let $records := notes:notesoftype($notes:authors),
	$records-no-notes := string-join(for $item in $records//text() return replace(string($item),"\[[^\]]+\]",""),","), (: strip out notes, concatenate:)
	$records-no-separators := for $item in $records-no-notes return tokenize($item,"(,|( and ))"),
	$authorstrings := for $item in $records-no-separators return replace(normalize-space($item),"(.*)\s([^\s]+)$", "$2, $1")
return
template:webpage(
	<div>
		{for $item in $authorstrings order by $item return <p>{$item}</p>}
	</div>
)
