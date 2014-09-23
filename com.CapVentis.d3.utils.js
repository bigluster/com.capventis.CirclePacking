/**
 * com.CapVentis.d3.utils
 * Routines to support use of d3 with Qlik Sense
 * @creator @owner Stephen Redmond
 * www.capventis.com 
 */


/// buildJSON
/// Takes a Qlik Sense data matrix and width info and
/// creates an array containing parent child information.
/// This array is then re-rendered into a JSON hierarchy
/// that can be used by d3 tree controls 
function buildJSON(qData, cubeWidth)
{
	// The array will hold our parent/child values
	var a=new Array();
	
	$.each( qData, function ( key, value ) {
		
		// We loop across the columns to generate keys and parent/child rows
		for (j=1; j<cubeWidth; j++)
		{
			var key="";
			var parent="";
			
			// We create a new key combining all the columns from 0 to whatever j is.
			for (var i=0; i<j; i++)
			{
				// unless we are at the last record, the separator is ~~
				var sep=(i<j-1) ? '~~' : '';
				// the parent separators stops at the last record -1
				var sep2=(i<j-2) ? '~~' : '';
				
				var vValue=value[i].qText==='-' ? '<NULL>' : value[i].qText;
				
				// Add the value of this column to the key 
				key += vValue + sep;
				
				// If we are not on the last record, add the value to the parent key
				if(i<j-1)
					parent += vValue + sep2;
				
			}
			
			// create a JSON object to hold the values 
			var r={};
			r.Id = key;
			r.Parent = parent;
			r.name = value[j-1].qText === '-' ? '<NULL>' : value[j-1].qText;
			
			// If j has reached the width over the cube, we can add the size value
			// This should be the last column in the cube - the measure 
			if(j==(cubeWidth-1))
			{
				if(value[cubeWidth-1].qNum === undefined)
					// remove the ',' from a formatted string - need to think about international!
					r.size=parseFloat(value[cubeWidth-1].qText.split(',').join(''),10);
				else
					r.size=value[cubeWidth-1].qNum;
			}

			// Add the JSON object to the array
			a.push(r);
		}
	} );

	// Convert the array to a hierarchical JSON object and return it 
	var rval=convertToJSON(a);

	return rval;
}

/// convertToJSON
/// Takes an array of objects that contains an Id field, Parent field and a 
/// size field only at the leaf node, and returns a hierarchical "flare"
/// E.g.:
/*
	var arr = [{ "Id": "1", "name": "abc1", "Parent": "" },	
			   { "Id": "2", "name": "abc2", "Parent": "" },
               { "Id": "1.1", "name": "abc1.1", "Parent": "1" },
               { "Id": "1.2", "name": "abc1.2", "Parent": "1" },
               { "Id": "2.1", "name": "abc1.1", "Parent": "2" },
               { "Id": "2.2", "name": "abc1.2", "Parent": "2" },
               { "Id": "1.1.1", "name": "abc1.1.1", "Parent": "1.1", "size": 100 },
               { "Id": "1.1.2", "name": "abc1.1.2", "Parent": "1.1", "size": 101 },
               { "Id": "1.2.1", "name": "abc1.1.1", "Parent": "1.2", "size": 120 },
               { "Id": "1.2.2", "name": "abc1.1.1", "Parent": "1.2", "size": 109 },
               { "Id": "2.1.1", "name": "abc1.1.1", "Parent": "2.1", "size": 130 },
               { "Id": "2.2.1", "name": "abc", "Parent": "2.2", "size": 150 }];
*/
function convertToJSON(array){
    var map = {};
    for(var i = 0; i < array.length; i++){
        var obj = array[i];
		if(!obj.size)
			obj.children= [];

        map[obj.Id] = obj;

        var parent = obj.Parent || '-';
        if(!map[parent]){
            map[parent] = {
				name: "flare",
				children: []
            };
        }
        map[parent].children.push(obj);
    }

    return map['-'];
}

