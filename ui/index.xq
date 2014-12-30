declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace log="http://cefn.com/readinglog/log" at "lib/xq/log.xq"; 

log:webpage(
    for $doc in $log:collection return $doc//h1
)