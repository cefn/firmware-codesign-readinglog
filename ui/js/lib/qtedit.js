require(['jquery'], function($){
    
    isChanged = false; //TODO CH namespace this properly
    
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
        isChanged = true;
    });
        
    //add behaviour for handling CTRL+S
    $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    editor.save(serializeDocument());
                    isChanged = false;
                    break;
                default:
                    break;
            }
        }
    });
    
    $(window).bind("beforeunload",function(event) {
        if (isChanged) {    
            event.returnValue = "You have unsaved changes";
            return event.returnValue
        }
        else{
            return;
        }
    });

    
    //do a load of readinglog improvement tasks with this functionality
    
    //add behaviour for closing hX or p tags, or alternately inserting <br/> (use Alt key?)
    
});
