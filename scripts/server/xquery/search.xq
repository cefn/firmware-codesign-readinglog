import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $text external;

(: Defines the set of text nodes matching the requested string:)
declare variable $needles := $notes:allnotes//text()[contains(.,$text)];
declare variable $types := distinct-values(for $item in $needles return notes:type($item));
declare variable $hashes := distinct-values(for $item in $needles return notes:paperhash($item)); (:CH TODO use root nodes instead? :)

template:webpage(
	<div>
		<h1>Search {$text} ({count($needles)})</h1>
		<table class="search">
		{
			for $type in $types order by notes:typepriority($type) descending,$type return (
				<tr>
					<th colspan="2"><h2>{$type}</h2></th>
				</tr>,
				for $note in $needles[notes:type(.)=$type]/root() return 
					<tr>
						<td class="ref">
							<em>{string($note//h1)}</em>
							{notes:paperlinks($note)}
						</td>
						<td class="text">
						{
							for $needle in $needles where $needle/root() is $note return 
								<p>
									{$needle}
								</p>
						}
						</td>
					</tr>
			)
		}
		</table>
	</div>
)
