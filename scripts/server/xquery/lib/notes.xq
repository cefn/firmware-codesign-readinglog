module namespace notes="http://cefn.com/readinglog/notes";

import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";

declare namespace ann = "http://www.zorba-xquery.com/annotations";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $notes:authors := "Authors";
declare variable $notes:concepts := "Concepts";
declare variable $notes:quotations := "Quotations";
declare variable $notes:headings := (
	$notes:authors,
	$notes:concepts,
	'Methodology',
	'Field of Study',
	'Quotations',
	'References'
);
declare variable $notes:errorlink := '/error';

(: Introspects the noted document's unique id from any doc or contained note node :)
(: TODO CH this should be generalised to permit URLs and ISBNs to be listed.
 Powells books seems a promising way to link to ISBNs e.g. http://www.powells.com/biblio/9781449342685
 though amazon may be able to do something similar with 10 digit ISBNs
 there is a visually identical unicode character to the forward slash with Unicode 0x2044 (fraction slash)
 :)
declare function notes:paperid($node){
	replace(base-uri(notes:paperroot($node)),".*/([^/]+)\.[^/]+$", "$1")
};

declare function notes:papertitle($node){
	notes:paperroot($node)//h1/string(.)
};

declare function notes:paperroot($node){
	typeswitch($node)
		case document-node() return $node
		default return root($node)
};

declare %ann:nondeterministic function notes:allnotes(){
	template:loadhtml("public/notes/")	
};

declare %ann:nondeterministic function notes:notesoftype($type){
	notes:filterbytype(notes:allnotes()//*,$type)
};

declare function notes:filterbytype($nodes,$type){
	$nodes[not(self::h2)][not(self::br)][preceding::h2[1]//text()[contains(.,$type)]][not(normalize-space(string(.))='')]
};

declare function notes:gettype($node){
	if($node/ancestor::h1) then 
			'Titles'
		else
			normalize-space(string-join($node/(preceding::h2[1])/text(),""))
};

declare function notes:followingheader($nodes,$title){
	$nodes//*[preceding-sibling::h2[1][text()[normalize-space(.)=$title]]]
};

(: Returns the type of a given item, either 'pdf', 'book' or 'url' :)
declare function notes:sourcetype($item){
	let $id := notes:paperid($item)
	return 
		if(starts-with($id,'isbn-')) then 
			'book' 
		else if(starts-with($id, 'http://')) then
			'url'
		else
			'pdf'
};

(: Accepts either hash values or nodes from within the noted paper :)
declare function notes:paperlinks($item){
	let $id := 	if($item instance of xs:string) then 
						$item
					else
						notes:paperid($item),
		$source := notes:sourcetype($item),
		$link := switch ($source)
					case 'book'	return concat('http://www.powells.com/biblio/', replace($id,'(isbn|-)',''))
					case 'url'	return $id
					case 'pdf' return concat('papers/',$id,'.pdf')
					default return $notes:errorlink
	return 
		<span>
			[<a href="{$link}">{$source}</a>&#160;<a href="notes/{$id}.html">notes</a>]
		</span>	
};

(: Indicates a priority order for individual note types e.g. in search results:)
declare function notes:typepriority($type){
	let $priorities := ('Titles','Notes','Concepts','Quotations'),
		$matches := index-of(reverse($priorities),$type)
	return if(count($matches)) then $matches[1] else 0
};

