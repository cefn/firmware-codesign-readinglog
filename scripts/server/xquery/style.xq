import module namespace template="http://cefn.com/readinglog/template" at "/home/cefn/Documents/highwire/participatory firmware design/readinglog/scripts/server/xquery/lib/template.xq";
import module namespace file = "http://expath.org/ns/file";
declare default element namespace "http://www.w3.org/1999/xhtml"; 

declare variable $styled external;

let $path := file:resolve-path($styled),
	$doc := doc($path) 
return
template:webpage(
	$doc//body/*
)