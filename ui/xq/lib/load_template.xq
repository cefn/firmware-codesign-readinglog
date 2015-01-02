declare default element namespace "http://www.w3.org/1999/xhtml";

declare function local:filter-descendants($item as node()) as node()* {
        let 
            $attributes := for $attribute in $item/@* return local:filter-item($attribute),
            $children := for $child in $item/node() return local:filter-item($child)
        return 
            ($attributes,$children)
};

declare function local:filter-item($item as node()) as node()? {
    typeswitch($item)
       case element() return (
           let $name := local-name($item)
           return 
               if ($name = 'html') then element {$name} {
                    local:filter-descendants($item)
               }
               else if ($name = 'title') then element {$name} {
                    (: Normalise title to match with first header :)
                    root($item)//*:h1[1]//text() 
               } 
               else if ($name = 'head') then ( element {$name} { 
                       (: TODO Introduce scripts at end of body for fast visual loading :)
                       local:filter-descendants($item),
                       <script type="text/javascript" data-main="js/lib/main" src="js/lib/require.js" >{comment {'prevent self-closing'}}</script>,
                       <script type="text/javascript">
                       <![CDATA[
                       ;
                       ]]>
                       </script>
                    }
               )
               else if($name = 'meta' and $item/@http-equiv and $item/@content) then 
                   <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
               else element {$name} { 
                    local:filter-descendants($item)
               }
        )
       case attribute() return 
           let $name := local-name($item)
           return attribute {QName('', $name)} {string($item)}
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