import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $embedded external;

template:webpage(
	<iframe src="{$embedded}" style="width:98%;height:98%;">
	</iframe>
)
