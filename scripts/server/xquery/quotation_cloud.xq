import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
import module namespace ft = "http://www.zorba-xquery.com/modules/full-text";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

template:webpage(
	<div>
		{for $quotation in notes:notesoftype($notes:quotations)[self::p][text()], (: consider only non-empty paragraphs:)
			$word in tokenize(string($quotation),'\W+'),
			$stem in ft:stem($word)
			group by $stem
			order by $stem
			return (for $item in $word return lower-case($word[1]), <br/>)
		}
	</div>
)


(: CH Need to try and make sense of why this works...
return (<em>{$stem}</em>,for $unique in distinct-values($word) return (lower-case($unique),count($word[.='design'])), <br/>)
...but this doesn't
return (<em>{$stem}</em>,for $unique in distinct-values($word) return (lower-case($unique),count($word[.=$unique])), <br/>)
 :)