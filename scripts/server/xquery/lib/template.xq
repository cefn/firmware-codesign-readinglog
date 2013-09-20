module namespace template="http://cefn.com/readinglog/template";

import module namespace notes="http://cefn.com/readinglog/notes" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/notes.xq";
import module namespace file = "http://expath.org/ns/file";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare namespace ann = "http://www.zorba-xquery.com/annotations";

(: templates a webpage, including the nodes specified :)
declare function template:webpage($nodes){
	<html>
		<head>
		    <meta content="text/html; charset=utf-16" http-equiv="content-type"></meta>
			<link href="style.css" rel="stylesheet" type="text/css"></link>
		</head>
		<body>
			<table>
				<tr>
					<td>
						<div id="menu">
								{template:menu()}
						</div>
					</td>
					<td>
						<div id="content">
								{$nodes}
						</div>
					</td>
				</tr>
			</table>
		</body>
	</html>
};

(: Returns all the document nodes of well-formed XHTML files in a given directory :)
declare %ann:nondeterministic function template:loadhtml($dirpath) {
	for $file in file:list($dirpath) where matches($file,'.+\.html$')
	let $absfile := file:resolve-path(concat($dirpath,$file))
	return doc($absfile)
};

(: Returns all the document nodes of the XHTML note files :)
declare function template:menu(){
	<ul>
		{
			for $item in $notes:headings return 
			<li><a href="heading.xq?match={$item}">{$item}</a></li>
		}
	</ul>
};
