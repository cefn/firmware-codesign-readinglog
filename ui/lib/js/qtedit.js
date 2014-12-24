require(['jquery'], function($){
    
    function serializeDocument(){
        var ser = new XMLSerializer();
        var mystr = ser.serializeToString(document.documentElement);
        return mystr;
    }
    
    //add behaviour for defocusing (also autosave?)
    function blurHandler(evt){
        evt.target.contentEditable=false;
        $(evt.target).unbind('blur',blurHandler);
        
        editor.autosave(serializeDocument());
    }
    
    //makes DOM text editable
    $("h1,h2,h3,h4,h5,h6,p").click(function(){
        this.contentEditable=true;
        $(this).bind('blur',blurHandler);
    });
    
    //add behaviour for handling CTRL+S
    $(window).keypress(function(e) {
        if (e.ctrlKey) {
            if (e.which=='s') {
                editor.save(serializeDocument());
            }
        }
    });
    
    //do a load of readinglog improvement tasks with this functionality
    
    //add behaviour for closing hX or p tags, or alternately inserting <br/> (use Alt key?)
    
});
