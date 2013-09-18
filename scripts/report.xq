import module namespace file = "http://expath.org/ns/file";
import module namespace html = "http://www.zorba-xquery.com/modules/converters/html";

declare variable $origpath := "../notes/";

<html xmlns="http://www.w3.org/1999/xhtml">
	<body>
		{for $origfile in file:list($origpath)[1] return $origfile 
		(: html:parse(file:read-text(concat($origpath,$origfile)))//h1 :)
		}
	</body>
</html>
