declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace logx="http://cefn.com/logx" at "lib/logx.xq";

let $headerstrings := $logx:collection//h2/string()
return
logx:webpage(
    for $item in distinct-values($headerstrings)
        let $count := count($headerstrings[.=$item])
        order by $count descending
        return <p>{($count, logx:viewer-link(string-join(('xq/entries.xq',concat('header=', $item)), '&amp;'), $item), ' ')}</p>
    (:
        return <a href="{logx:viewer-link(string-join(('xq/entries.xq',concat('header=', $item), '&amp;')}">{$item}</a>
    :)
)