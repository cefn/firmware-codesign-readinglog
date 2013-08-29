
(: List concepts:)
for $item in //*:p[preceding-sibling::*:h2[1][text()='Concepts']]/text() return concat($item,'&#x0A;&#x0A;')

(: List the ids of documents which have no text in the Concepts field :)
for $item in //*:body[descendant-or-self::*:p[preceding-sibling::*:h2[1][text()='Concepts']]/text()] return for $href in $item/*:h1/*:a/@href return replace(xs:string($href),".*/([\w]+).pdf","$1")
