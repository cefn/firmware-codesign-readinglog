declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace logx="http://cefn.com/logx" at "lib/logx.xq";

logx:webpage(
    <div>
        <h1>Each Page Below Represents a Task </h1>
        {
            for $item in (
                logx:viewer-link('xq/tasks/tag.xq', 'Tag papers'),
                logx:viewer-link('xq/tasks/year.xq', 'Annotate with Year'),
                logx:viewer-link('xq/tasks/scan.xq', 'Scan content of paper')
            )
            return <p>{$item}</p>
        }
    </div>
)