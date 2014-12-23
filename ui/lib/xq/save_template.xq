declare function local:filter-descendants($item as node()) as node()* {
        let 
            $attributes := for $attribute in $item/@* return local:filter-item($attribute),
            $children := for $child in $item/node() return local:filter-item($child)
        return 
            ($attributes,$children)
};

declare function local:filter-item($item as node()) as node()? {
    typeswitch($item)
       case element() return 
            let $name := local-name($item)
            return element {$name} { 
                local:filter-descendants($item) 
            }
       case attribute() return 
           let $name := local-name($item)
           return attribute {QName('', $name)} {
                string($item)
           }
       case text() return 
           text{$item}
       case processing-instruction() return 
           $item
       case comment() return 
           $item
       default return
           local:filter-descendants($item) (: Just passes back children if any - handles case of root/doc node? :)
};

local:filter-item(.)