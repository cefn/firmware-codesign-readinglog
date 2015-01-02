declare function local:filter-element($item as element()) as element()? {
    let $name := name($item),
        $attributes := for $attribute in $item/@* return local:filter-item($attribute),
        $children := for $child in $item/node() return local:filter-item($child)
    return 
    element {$name} {
        $attributes,
        $children
    }
};

declare function local:filter-attribute($item as attribute()) as attribute()? {
    attribute {name($item)} {$item}
};

declare function local:filter-text($item as text()) as text()? {
    text{$item}
};

declare function local:filter-item($item as node()) as node()? {
    typeswitch($item)
       case element() return local:filter-element($item)
       case attribute() return local:filter-attribute($item)
       case text() return local:filter-text($item)
       default return $item/node()/local:filter-item(.) (: Just passes back children if any - handles case of root/doc node:)
};

local:filter-item(.)