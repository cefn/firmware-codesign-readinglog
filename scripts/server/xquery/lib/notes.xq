module namespace notes="http://cefn.com/readinglog/notes";

import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";

declare namespace ann = "http://www.zorba-xquery.com/annotations";

declare default element namespace "http://www.w3.org/1999/xhtml";

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

declare %ann:nondeterministic function notes:allnotes(){
	template:loadhtml("public/notes/")
};

(: Introspects the noted document's unique id from any note element :)
declare function notes:paperhash($node){
	root($node)//comment()[contains(string(.),"UNIQUE HASH")]/replace(string(.)," UNIQUE HASH ([\w]+) ", "$1")
};

declare %ann:nondeterministic function notes:notesoftype($type){
	notes:allnotes()//*[not(self::h2)][preceding::h2[1]//text()[contains(.,$type)]]
};

declare function notes:followingheader($nodes,$title){
	$nodes//*[preceding-sibling::h2[1][text()[normalize-space(.)=$title]]]
};

declare function notes:paperlinks($node){
	let $hash := notes:paperhash($node)
	return 
	<span>
		[	
			<a href="notes/{$hash}.html">notes</a>&#160;
			<a href="papers/{$hash}.pdf">pdf</a>&#160;
			<a href="trigger?hash={$hash}&amp;action=viewpaper">load</a>
		]
	</span>
};

