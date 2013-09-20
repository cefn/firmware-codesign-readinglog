module namespace notes="http://cefn.com/readinglog/notes";

import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";

declare namespace ann = "http://www.zorba-xquery.com/annotations";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $notes:headings := ('Concepts','Methodology','Field of Study','Quotations','References');

declare %ann:nondeterministic function notes:allnotes(){
	template:loadhtml("../../notes/")
};

declare function notes:followingheader($nodes,$title){
	$nodes//*[preceding-sibling::h2[1][text()=$title]]
};
