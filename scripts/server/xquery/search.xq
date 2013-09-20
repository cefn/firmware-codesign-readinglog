import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $text external;

(: Defines the set of text nodes matching the requested string:)
declare variable $needles := notes:allnotes()//text()[contains(.,$text)];

template:webpage(
	<div>
		<h1>Search {$text} ({count($needles)})</h1>
		{
		for $needle in $needles return 
			<p>
				{$needle}
				{notes:paperlinks($needle)}
			</p>
		}
	</div>
)
