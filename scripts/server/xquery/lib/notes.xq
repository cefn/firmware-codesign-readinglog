module namespace notes="http://cefn.com/readinglog/notes";

import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";

declare namespace ann = "http://www.zorba-xquery.com/annotations";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $notes:allnotes := template:loadhtml("public/notes/");
declare variable $notes:papertitles := $notes:allnotes//h1;

declare variable $notes:authors := "Authors";
declare variable $notes:concepts := "Concepts";
declare variable $notes:headings := (
	$notes:authors,
	$notes:concepts,
	'Methodology',
	'Field of Study',
	'Quotations',
	'References'
);

(: Introspects the noted document's unique id from any note element :)
declare function notes:paperhash($node){
	root($node)//comment()[contains(string(.),"UNIQUE HASH")]/replace(string(.)," UNIQUE HASH ([\w]+) ", "$1")
};

declare %ann:nondeterministic function notes:notesoftype($type){
	$notes:allnotes//*[not(self::h2)][preceding::h2[1]//text()[contains(.,$type)]]
};

declare function notes:type($node){
	if($node/ancestor::h1) then 
			'Titles'
		else
			normalize-space(string-join($node/(preceding::h2[1])/text(),""))
};

declare function notes:followingheader($nodes,$title){
	$nodes//*[preceding-sibling::h2[1][text()[normalize-space(.)=$title]]]
};

declare function notes:paperlinks($hash as xs:string){
	<span>
		[<a href="notes/{$hash}.html">notes</a>&#160;<a href="papers/{$hash}.pdf">pdf</a>&#160;<a href="trigger?hash={$hash}&amp;action=viewpaper">load</a>]
	</span>	
};

(: Indicates a priority order for individual note types e.g. in search results:)
declare function notes:typepriority($type){
	let $priorities := ('Titles','Notes','Concepts','Quotations'),
		$matches := index-of(reverse($priorities),$type)
	return if(count($matches)) then $matches[1] else 0
};

