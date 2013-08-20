
(: List concepts:)
for $item in //*:p[preceding-sibling::*:h2[1][text()='Concepts']]/text() return concat($item,'&#x0A;&#x0A;')
