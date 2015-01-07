declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace logx="http://cefn.com/logx" at "lib/logx.xq";

logx:webpage(
    for $doc in $logx:collection
        let $textcount := count($doc//p//text())
        order by $textcount descending
        return
            <div>
        {$textcount} {logx:editor-link(($doc//h1[1]))}
    </div>
)