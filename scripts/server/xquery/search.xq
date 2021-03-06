import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $text external;

(: Defines the set of text nodes matching the requested string:)
let $match := replace($text,'\+',' '),
	$needles := notes:allnotes()//text()[matches(.,$match,'i')],
	$types := distinct-values(for $item in $needles return notes:gettype($item))
return 

(: TODO CH refactor to use grouping logic demostrated in authors.xq if possible, 
	to minimise complexity and separate querying from templating:)
template:webpage(
	<div>
		<h1>Search: "{$match}" ({count($needles)} matches)</h1>
		<table class="search">
		{
			for $note in $needles/root() return (
				<tr>
					<th colspan="2" class="ref">
						<em>{$note//h1/string(.)}</em>
						{notes:paperlinks($note)}
					</th>
				</tr>,
				for $type in distinct-values($needles[root()=$note]/notes:gettype(.)) order by notes:typepriority($type) return(
					<tr>
						<td class="type">
							<p><em>{$type}</em></p>
						</td>
						<td class="text">
						{
							for $needle in $needles[notes:gettype(.)=$type][root()=$note] return 
								<p>
									{$needle}
								</p>
						}
						</td>
					</tr>
				)
			)
		}
		</table>
	</div>
)
