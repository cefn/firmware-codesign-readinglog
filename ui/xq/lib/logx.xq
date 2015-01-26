module namespace logx="http://cefn.com/logx";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $logx:sourceurls as xs:string external;

declare variable $logx:collection := logx:aggregate($logx:sourceurls);

declare variable $logx:authors := "Authors";
declare variable $logx:concepts := "Concepts";
declare variable $logx:field := "Field of Study";
declare variable $logx:methodology := "Methodology";
declare variable $logx:notes := "Notes";
declare variable $logx:quotations := "Quotations";
declare variable $logx:references:= "References";
declare variable $logx:relevance := "Relevance";
declare variable $logx:title := "Title";
declare variable $logx:tags := "Tags";

(:
	Provisional assignment of punctuation to tags
	! = relevance
	? = question
	# = concept
	@ = ...
:)

declare variable $logx:headings := (
	$logx:authors,
	$logx:notes,
	$logx:tags,
	$logx:relevance,
	$logx:quotations,
	$logx:field,
	$logx:concepts,
	$logx:methodology,
	$logx:references
);

declare function logx:descendants-of-type($ancestor,$type){
	$ancestor//text()[logx:gettype(.)=$type]
};

declare function logx:hascontent($items as node()*){
	normalize-space(string($items)) != ''
};

(: Retrieves (preceding) heading name given a content node :)
declare function logx:gettype($content){
	if($content/parent::h1) then
		$logx:title
	else
		normalize-space(string-join($content/(preceding::h2[1])/text(),""))
};

(:declare function logx:filterbytype($nodes,$type){
	$nodes[not(self::h2)][not(self::br)][preceding::h2[1]//text()[contains(.,$type)]][not(normalize-space(string(.))='')]
};:)

declare function logx:paperid($node){
	replace(base-uri(logx:paperroot($node)),".*/([^/]+)\.[^/]+$", "$1")
};

declare function logx:papertitle($node){
	logx:paperroot($node)//h1/string(.)
};

declare function logx:paperroot($node){
	typeswitch($node)
		case document-node() return $node
		default return root($node)
};


declare function logx:aggregate($filepaths as xs:string){
    for $token in tokenize($filepaths, ',') return doc(resolve-uri($token))
};

declare function logx:editor-link($node){
	logx:editor-link($node, $node//text())
};

declare function logx:editor-link($node, $text){
	<a href="javascript:void(editor.loadfocus('{document-uri(root($node))}'))">{$text}</a>
};

declare function logx:viewer-link($path, $nodes){
	<a href="javascript:void(viewer.loadquery('{$path}'))">{$nodes}</a>
};

(: Returns all the document nodes of the XHTML note files :)
declare function logx:menu(){
	for $item in (
		logx:viewer-link('xq/index.xq','Home'),
		logx:viewer-link('xq/tasks.xq','Tasks'),
		logx:viewer-link('xq/headers.xq','Browse')
	)
	return ($item,' ')
};

(: templates a webpage, including the nodes specified :)
declare function logx:webpage($nodes){
	<html>
		<head>
		    <meta content="text/html; charset=utf-16" http-equiv="content-type"></meta>
			<link href="/style.css" rel="stylesheet" type="text/css"></link>
		</head>
		<body>
			<table id="layout" style="height:99%;width:99%;">
				<tr class="top">
					<td id="menu" colspan="2">
						{logx:menu()}
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
					<td colspan="3">
						<div id="content">
								{$nodes}
						</div>
					</td>
				</tr>
			</table>
		</body>
	</html>
};
