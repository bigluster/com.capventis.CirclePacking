/**
 * com.CapVentis.CirclePacking
 * Implementation of d3 Circle Packing visualization for Qlik Sense
 * Based on d3 sample code from Mike Bostock: https://github.com/mbostock/d3/wiki/Pack-Layout
 * @creator @owner Stephen Redmond
 * www.capventis.com 
 */

define( ["jquery", "qlik", "./d3.min", "./com.CapVentis.d3.utils"], function ( $, qlik ) { 

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 3,
					qHeight: 1000
				}]
			}
		},
		//property panel
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 2
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},

		paint: function ( $element, layout ) {
			var app=qlik.currApp();
			
			// Assign variables
			var self = this, 
				dimensions = layout.qHyperCube.qDimensionInfo,
				qData = layout.qHyperCube.qDataPages[0].qMatrix,
				cubeWidth=layout.qHyperCube.qSize.qcx;

			// Get the chart ID from the Sense document for this control
			var divName = 'div_' + layout.qInfo.qId;

			// Calculate the height and width that user has drawn the extension object
            var vw = $element.width();
            var vh = $element.height();

			// Replace the QS element with a new Div
			$element.html( '<div id="' + divName + '"></div>' );

			// Build the JSON hierarchy from the data cube
			var root=buildJSON(qData, cubeWidth);

			// Use QS color range 
			var palette = [
			 '#4477aa',
			 '#117733',
			 '#ddcc77',
			 '#cc6677',
			 '#7db8da',
			 '#b6d7ea',
			 '#b0afae',
			 '#7b7a78',
			 '#545352',
			 '#46c646',
			 '#f93f17',
			 '#ffcf02',
			 '#276e27'
			];						

			// Build the chart using the d3 library
			var format = d3.format(",d"),
				color = d3.scale.ordinal().range(palette); //category20c();

			var bubble = d3.layout.pack()
				.sort(null)
				.size([vw, vh])
				.padding(1.0);

			var svg = d3.select("#"+divName).append("svg")   
				.attr("width", vw)
				.attr("height", vh)
				.attr("class", "bubble");
			  
			var node = svg.selectAll(".node")
			  .data(bubble.nodes(classes(root))
			  .filter(function(d) { return !d.children; }))
			  .enter().append("g")
			  .attr("class", "node")
			  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

			node.append("title")
			  .text(function(d) { return d.className + ": " + d.value.toLocaleString(undefined,{maximumFractionDigits: 2}); });  // locale string undefined to use local

			node.append("circle")
			  .attr("r", function(d) { return d.r; })
			  .style("fill", function(d) { return color(d.packageName); });

			node.append("text")
			  .attr("dy", ".3em")
			  .style("text-anchor", "middle")
			  .text(function(d) { return d.className.substring(0, d.r / 3); });

			var vColumnSelect=layout.qHyperCube.qSize.qcx-2;

			// Add a click event to make a selection in QS 
			node.on('click', function(d){
				var vSelections=d.className;
				var vDimension=layout.qHyperCube.qDimensionInfo[vColumnSelect].qFallbackTitle;
				app.field(vDimension).selectMatch(vSelections,true);
			});
				
		}
	};

} );

function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

