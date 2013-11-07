MUDSLIDE = function(){ 
	/** Universal access for global variable regardless of browser or non-browser environment. */
	function getGlobal(){ //from http://www.nczonline.net/blog/2008/04/20/get-the-javascript-global/
			return (function(){return this;})();
	}
		
	/**
	 * @param {Object} from The object from which the properties should be copied.
	 * @param {Object,String} to The object or global name of object to which the properties should be copied.
	 * @param {Object} propnames The property names which should be copied. If omitted, all properties are copied.
	 */
	function copyProperties(from,to,propnames){ //if propname omitted all named properties copied
		if(!propnames){
				propnames = [];
				for(name in from){
						propnames.push(name);
				}
		}
		if(typeof to == 'string'){
				if(to in getGlobal()){
						to = getGlobal()[to]; //use existing object of this name
				}
				else{
						to = getGlobal()[to]={}; //create new object
				}
		}
		for(var idx = 0; idx < propnames.length; idx++){
				to[propnames[idx]] = from[propnames[idx]];
		}
		return to;
	}
	
	/** Defines an order for document nodes corresponding to document order. */
	function compareDocumentNodes(a,b){
		return $(a).xpath("preceding::*").size() - $(b).xpath("preceding::*").size();
		//TODO should be replaced with logic based on the below for efficiency
		/*
		if(a === b){
			return 0;
		}
		else{
			return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING == 0 ? -1 : 1;
		}
		*/
	}
	
	/*
	function  compareDocumentNodes(a,b) {
		return 3 - (a.compareDocumentPosition(b) & 6);
    }
    */

	
	/* creates aggregate compare from array of functions in descending priority */
	function orderBy(compareFunctions){ 
		return function(a,b){
			var result;
			for(var i = 0; i < compareFunctions.length;i++){
				result = compareFunctions[i](a,b);
				if(result == 0){
					continue;
				}
				else{
					break;
				}
			}
			return result;
		};
	}
	
		function clone(o){
		return copyProperties(o,{});
	}
	
	/** deep clone with each reference duplicated exactly once excepting global reference. */
	function deepClone(o, visited){
		if(!visited){
			visited = [];
		}
		var newitem = clone(o);
		for(var key in newitem){
			var child = newitem[key];
			if($.inArray(child, visited) || child === getGlobal()){ //try to prevent circular or runaway
				continue; //skip this value
			}
			visited.push(child);
			newitem[key] = deepClone(child, visited);				
		}
		return newitem;
	}
	
		/** Creates a JSON representation of properties exported from the closure namespace, to be passed to eval */
	function writeScopeExportCode(propnames){
		var pairs = [];
		propnames.forEach(function(item){pairs.push("\"" + item + "\":" + item);});
		return "({" + pairs.join(",") + "})";                 
	}

		/** Returns exported values and functions. */
	return eval(writeScopeExportCode([
		"copyProperties", "compareDocumentNodes", "clone","orderBy", "writeScopeExportCode"
	]));

}();
