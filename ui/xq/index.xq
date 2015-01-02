declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace log="http://cefn.com/readinglog/log" at "lib/log.xq"; 

log:webpage(
    for $doc in $log:collection return log:editor-link(($doc//h1[1]))
)