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
			<link href="/style.css" rel="stylesheet" type="text/css"></link>
		</head>
		<body>
			<table id="layout" style="height:99%;width:99%;">
				<tr class="top">
					<th id="logo">
						<em><a href="/">Log</a></em>
					</th>
					<td id="menu" colspan="2">
						{template:menu()}
					</td>
					<td id="searchform">
						<form action="/search.xq">
							<table>
								<tr>
									<td><input type="text" name="text" /></td>
									<td><input type="submit" value="Search"/></td>
								</tr>
							</table>
						</form>
					</td>
				</tr>
				<tr class="bottom">
					<td colspan="4">
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
		<li><a href="/authors.xq">Authors</a></li>
		{
			for $item in $notes:headings where not($item='Authors')
			return 
			<li><a href="/heading.xq?type={$item}">{$item}</a></li>
		}
	</ul>
};

(: TODO CH Weird Zorba bug to report - declaring content within XML attribute 
	literal causes spurious output of a text node as well as insertion of the text
	in the style attribute - try let $share := 100 idiv count($items)  and style="width:{$share}%;" 
	within a td literal instead of attribute constructor below to observe the problem :)
declare function template:tabulate($items){
	let $tdstyle := concat("width:",100 idiv count($items),"%;")
	return 
		<table style="width:100%">
			<tr>
				{
					for $item in $items return 
					<td style="{$tdstyle}">
						{$item}
					</td>
				}
			</tr>
		</table>
};