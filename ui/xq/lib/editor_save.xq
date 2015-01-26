declare default element namespace "http://www.w3.org/1999/xhtml";

declare function local:filter-items($items as node()*) as node()* {
    for $item in $items return
        typeswitch($item)
           case element() return
                let $name := local-name($item)
                return
                    if( $name = 'script' ) then
                        ()
                    else
                        element {$name} {
                            local:filter-descendants($item)
                        }
           case attribute() return
               let $name := local-name($item),
                   $value := string($item),
                   $duplicate := attribute {QName('', $name)} { $value }
               return
                   if ( $name = 'contenteditable' ) then ()
                   else if($name='href') then
                       let $pdfurl := replace($value,"javascript:pdf\.loadpdf\('([^)]+)'\);","$1") (: try to extract pdf url :)
                       return if($pdfurl != '') then attribute href {$pdfurl} (: process href:) else $duplicate
                   else $duplicate
           case text() return
               text{$item}
           case processing-instruction() return
               $item
           case comment() return
               $item
           default return
               local:filter-descendants($item) (: Just passes back children if any - handles case of root/doc node? :)
};

declare function local:filter-descendants($item as node()) as node()* {
    local:filter-items(local:get-descendants($item))
};

declare function local:get-descendants($item as node()) as node()*{
    let $attributes := $item/@*,
        $children := $item/node()
    return ($attributes,$children)
};

local:filter-items(.)