(function(){

	var tree = raw.model();

var joiner = function(object, glue, separator) {

 
if (glue == undefined)
glue = '=';
 
if (separator == undefined)
separator = ',';
 
return $.map(Object.getOwnPropertyNames(object), function(k) { return [k, object[k]].join(glue) }).join(separator);
}
   




    var hierarchy = tree.dimension('hierarchy')
       .title('Hierarchy')
       .description("This is a description of the hierarchy that illustrates what the dimension is for and other things.")
       .multiple(true);

    var size = tree.dimension('size')
       .title('Size')
       .description("This is a description of the hierarchy that illustrates what the dimension is for and other things.")
       .accessor(function (d){ return +d; })
       .types(Number)

	tree.map(function (data){
		
      var root = { children : [], xdata:[], raw : data, name:"" };
      //assume that there is 

      var labels = d3.set([]);
      data.forEach(function (d){

        if (!hierarchy()) return root;

        var leaf = seek(root, hierarchy(d), hierarchy());
        if(leaf === false || !leaf) return;
        if (!leaf.xdata) leaf.xdata = [];
        leaf.size = size() ? +size(d) : 0;
        leaf.all = d;
        delete leaf.children;
      });




      return root;

    });



    function seek(root, path, classes) {
      if (path.length < 1) return false;
      if (!root.children) root.children = [];
      //if (!root.xdata) root.xdata = [];
      var p = root.children.filter(function (d){ return d.name == path[0]; })[0];

      if (!p) {
        if( /\S/.test(path[0]) ) {
          p = { name: path[0], class:classes[0], children:[]};  
          root.children.push(p);
        } else p = root;
      }
      if (path.length == 1) return p;
      else return seek(p, path.slice(1), classes.slice(1));
    }
	var chart = raw.chart()
        .title('Dendrogram bar')
		.description(
            "A dendrogram and bar chart combination useful for visualising multivariant categorical data")
		.thumbnail("imgs/heatmap.png")
		.model(tree);



	var width = chart.number()
		.title('Width')
		.defaultValue(100)
		.fitToWidth(true);
	
	var height = chart.number()
		.title("Height")
		.defaultValue(800);

	var padding = chart.number()
		.title("Padding")
		.defaultValue(20);



	chart.draw(function (selection, data){
//tree is the right data model - the last node in the tree is the Y axis
	


		var g = selection
            .attr("width", +width() )
            .attr("height", +height() )
            .append("g")
                .attr("transform", "translate(40,0)");


        var marginBottom = 20,
			h = height()*0.7 ;



        var layout = d3.layout.tree()
            .size([+h, +width()/6]);

        var diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        var nodes = layout.nodes(data),
            links = layout.links(nodes);

// var xScale = x.type() == "Date"
//         ? d3.time.scale().range([marginLeft,width()-maxRadius()]).domain(xExtent)
//         : d3.scale.linear().range([marginLeft,width()-maxRadius()]).domain(xExtent)
      
     

    //var xScale = d3.scale.ordinal().domain(data.labels).rangePoints([padding(), width()*0.6],0);
     var   sizeScale = d3.scale.linear().range([0, width()*0.6 ]).domain([0, d3.max(data.raw, function (d){ return size(d); })]);


        var link = g.selectAll("path.link")
            .data(links)
            .enter().append("path")
                .attr("class", "link")
                .style("fill","none")
                .style("stroke-width",function(d){
                  if (d.source.name==="" ) 
                    { 
                      return "0px" 
                    } 
                     return "1px" 
                  })
                .style("stroke",  "#ccc" )
                .attr("d", diagonal);

        var node = g.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });


        
        var xAxis = d3.svg.axis().scale(sizeScale).tickSize(-h*0.8).orient("bottom");

        g.append("g")
            .attr("class", "x axis")
            .style("stroke-width", "1px")
        	.style("font-size","10px")
        	.style("font-family","Arial, Helvetica")
            .attr("transform", "translate(" + width()/6 + "," + (h-marginBottom + padding()) + ")")
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });



        node.append(  "svg:line")
            .attr("x1", 0)
            .attr("x2", function(d){ return d.children ?  0 : width()*0.6;}).style("stroke","#ccc");
        node.append("text")
            .attr("dx", function(d) { return d.children ?   -8  : width()*0.6 + padding(); })
            //.attr("dx", -8 )
            .attr("dy", 3)
            .style("font-size","11px")
            .style("font-family","Arial, Helvetica")
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            //.attr("text-anchor", "end" )
            .text(function (d){ return d.name; });

        node.append("rect")
            .style("fill", "#ccc")
            .style("stroke","#999999")
            .style("stroke-width","1px")
            .attr("width", function(data) { return  (sizeScale(data.size) ) ; })
            .attr("transform", "translate(0," + -2.25 + ")")
            .attr("height", 4.5);
        // var selectcircles = node.selectAll("circle").data(function(d){ if (typeof(d.xdata) != "undefined"  ) { return d.xdata} return [] }).enter();

		d3.selectAll("x.axis line, .x.axis path")
         	.style("shape-rendering","crispEdges")
         	.style("fill","none");
         	//.style("stroke","#ccc");

        // selectcircles.append("circle")
        // .attr("r", function (d){ return sizeScale(d.size) })
        // .attr("transform", function(data) { return "translate(" + (xScale(data.label) ) + "," + 0 + ")"; })
        // .attr("title",  function(d) { return joiner(d.all, ": ","\n" )})
        // .style("fill", function(d) { return colors() ? colors()(d.color) : "#eeeeee"; });


        // node.each(function (d,i){

        // 	if (typeof(d.xdata) != "undefined"  ){
        // 		console.log("trying");
	       //  	d3.select(this).append("circle").selectAll("circle").data(d.xdata).enter()
	       //  	.append("circle")
	       //  	//.attr("r",function (d){ return d.size; })
	       //  	.attr("r",10)
	       //  	.attr("transform", function(d) { return "translate(" + xScale(d.label) + "," + 0 + ")"; })
	       //  	.style("fill", "black")   //function(d) { return colors() ? colors()(d.color) : "#eeeeee"; })
	       //      .style("fill-opacity", .9)

	       //  	;

        // 	}

        // });

        


        

	})

})();