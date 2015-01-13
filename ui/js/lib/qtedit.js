require(['jquery'], function($){
    
    isChanged = false; //TODO CH namespace this properly
    
    //TODO CH, this is specific to editing pdf readinglog notes
    //should be in separate javascript library from the editor logic
    $("h1 a").each(function(){
        var thisq = $(this);
        var href=thisq.attr("href");
        href = "javascript:pdf.loadpdf('" + href + "')";
        thisq.attr("href",href);
    });
    
    function serializeDocument(){
        var ser = new XMLSerializer();
        var mystr = ser.serializeToString(document.documentElement);
        return mystr;
    }
    
    //add behaviour for defocusing (also autosave?)
    function blurHandler(evt){
        $(evt.target).removeAttr("contenteditable");
        $(evt.target).unbind('blur',blurHandler);    
        editor.autosave(serializeDocument());
    }
    
    var editableselector = "h1,h2,h3,h4,h5,h6,p";
    
    //makes DOM text editable
    $(document).on("click", editableselector, function(){
        this.contentEditable=true;
        $(this).bind('blur',blurHandler);
        isChanged = true;
    });
            
    //add behaviour for handling CTRL+S
    $(window).bind('keydown', function(event) { //TODO CH detect keys intelligently to detect actual changes to text
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
        if(event.which == 13) { //ensures new paragraphs are created when enter is hit
            var selection = window.getSelection();
            var oldrange = selection.getRangeAt(0);
            if (oldrange.collapsed) { //checks that there's just an ordinary cursor position
                
                var oldtextnode = oldrange.startContainer;
                var oldeditableq = $(oldtextnode).closest(editableselector);
                oldeditableq.blur();
                oldeditableq.removeAttr("contenteditable");
                
                //split the text where the cursor is
                var text = oldtextnode.data;
                var textbefore = text.substring(0,oldrange.startOffset);
                var textafter = text.substring(oldrange.startOffset);
                
                //create para, after old element, acquire text child 
                var neweditableq = $("<p contenteditable='true'></p>");
                oldeditableq.after(neweditableq);
                neweditableq.focus();
                neweditableq.text("");
                var newtextnode = neweditableq.contents().get(0);
                
                //assign text to the two nodes
                oldtextnode.data = textbefore; //assign 'before' text to text node
                newtextnode.data = textafter; //assign 'after' text to new editable
                //move editing and focus to the new node
                //position cursor in the new text node
                var newrange = document.createRange();
                newrange.setStart(newtextnode,0); 
                newrange.setEnd(newtextnode,0);
                selection.removeAllRanges();
                selection.addRange(newrange);
                return false;
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
