import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
import module namespace functx="http://www.functx.com/";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

(: Defines the set of text nodes matching the requested string:)
template:webpage(
			for	$records in notes:notesoftype($notes:authors),
				$records-no-notes in string-join(for $item in $records//text()[not(normalize-space(.)='')] return replace(string($item),"\[[^\]]+\]",""),","), (: strip out notes, concatenate:)
				$records-no-separators in for $item in $records-no-notes return tokenize($item,"((,? +AND +)|(,? ?&amp; ?)|(,? +and +)|,)"),
				$records-no-space in for $item in $records-no-separators return normalize-space($item),
				$records-distinct in distinct-values($records-no-space), 
				$record-normal in for $item in $records-distinct return replace(normalize-space($item),"(.*)\s([^\s]+)$", "$2") 
			group by $record-normal
			order by $record-normal
			return 
			for $item in $records/root()//text()[notes:gettype(.)='Quotations'] return
				<p>{functx:capitalize-first(lower-case($record-normal))}</p>
)