module namespace log="http://cefn.com/readinglog/log";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $log:filepaths as xs:string external;

declare variable $log:collection := log:aggregate($log:filepaths);

declare function log:aggregate($filepaths as xs:string){
    for $token in tokenize($filepaths, ',') return doc(resolve-uri($token))
};

declare function log:editor-link($node){
	log:editor-link($node, $node//text())
};

declare function log:editor-link($node, $text){
	<a href="javascript:editor.load('{document-uri(root($node))}');">{$text}</a>
};

(: Returns all the document nodes of the XHTML note files :)
declare function log:menu(){
	<ul>
		<li><a href="">Item1</a></li>
		<li><a href="">Item2</a></li>
	</ul>
};

(: templates a webpage, including the nodes specified :)
declare function log:webpage($nodes){
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
						{log:menu()}
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
