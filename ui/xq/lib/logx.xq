module namespace logx="http://cefn.com/logx";

declare default element namespace "http://www.w3.org/1999/xhtml";

declare variable $logx:sourceurls as xs:string external;

declare variable $logx:collection := logx:aggregate($logx:sourceurls);

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
	<ul>
		<li>
			{logx:viewer-link('xq/index.xq','Home')}
		</li>
		<li>
			{logx:viewer-link('xq/untagged.xq','Untagged')}
		</li>
		<li><a href="">Item2</a></li>
	</ul>
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
					<th id="logo">
						<em><a href="/">Log</a></em>
					</th>
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
