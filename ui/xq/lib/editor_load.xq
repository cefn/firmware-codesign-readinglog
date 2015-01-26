declare default element namespace "http://www.w3.org/1999/xhtml";

import module namespace logx="http://cefn.com/logx" at "logx.xq";

declare function local:filter-body($body){
    let $new := (
            $body/h1,
            for $heading in $logx:headings return
                let $oldheading := $body/h2[normalize-space(string(.))=$heading],
                    $oldcontent := $body/*[not(self::h2)][./preceding::h2[1]=$oldheading]
                return
                    if($oldheading) then
                        ($oldheading,$oldcontent)
                    else
                        <h2>{$heading}</h2>
        ),
        $old := $body/node(),
        $extra := $old except $new
    return ($new, $extra)
};

declare function local:filter-items($items as node()*) as node()* {
    for $item in $items return
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
                   else if($name = 'body') then
                        local:filter-body($item)(: $item :)
                   else element {$name} {
                        local:filter-descendants($item)
                   }
            )
           case attribute() return
               let $name := local-name($item),
                   $value := string($item)
               return
                   if($name='href' and contains($value,'.pdf') and not(contains($value,'javascript'))) then
                       attribute href {concat("javascript:pdf.loadpdf('", $value , "');")} (: process href:)
                   else
                       attribute {QName('', $name)} { $value } (: duplicate :)
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