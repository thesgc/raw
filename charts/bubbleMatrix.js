(function(){

	var tree = raw.model();

    var hierarchy = tree.dimension('hierarchy')
       .title('Hierarchy')
       .description("This is a description of the hierarchy that illustrates what the dimension is for and other things.")
       .multiple(true);

    var size = tree.dimension('size')
       .title('Size')
       .description("This is a description of the hierarchy that illustrates what the dimension is for and other things.")
       .accessor(function (d){ return +d; })
       .types(Number)

    var color = tree.dimension('color')
       .title('Color')




    var label = tree.dimension('label')
       .title('X Axis and Label')
       

	tree.map(function (data){
      var root = { children : [], xdata:[] };
      //assume that there is 

      var labels = d3.set([]);
      data.forEach(function (d){

        if (!hierarchy()) return root;

        var leaf = seek(root, hierarchy(d), hierarchy());
        if(leaf === false || !leaf) return;
        //We have got to the bottom of the Y axis tree, now we must push this data point to the x axis data for this leaf
        if (!leaf.xdata) leaf.xdata = [];
        var xdatum = {};

        xdatum.size = size() ? +size(d) : 0;

        xdatum.color = color(d);
        xdatum.label = label(d);
        leaf.xdata.push(xdatum);
        labels.add(label(d));
        delete leaf.children;
      });



      root.labels = labels.values();

      return root;

    });



    function seek(root, path, classes) {
      if (path.length < 1) return false;
      if (!root.children) root.children = [];
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
        .title('Dendrogram bubble matrix')
		.description(
            "A dendrogram and Bubble Matrix combination useful for visualising multivariant categorical data <br/>Based on <a href='https://github.com/benbria/d3.chart.bubble-matrix'>https://github.com/benbria/d3.chart.bubble-matrix</a>")
		.thumbnail("imgs/heatmap.png")
		.model(tree);



	var width = chart.number()
		.title('Width')
		.defaultValue(100)
		.fitToWidth(true);
	
	var height = chart.number()
		.title("Height")
		.defaultValue(500);

	var padding = chart.number()
		.title("Padding")
		.defaultValue(5);

	var colors = chart.color()
		.title("Color scale");

	

	chart.draw(function (selection, data){
//tree is the right data model - the last node in the tree is the Y axis
	
var xScale = d3.scale.ordinal().domain(data.labels).rangePoints([0, width()/2], 0);
	var g = selection
            .attr("width", +width() )
            .attr("height", +height() )
            .append("g")
                .attr("transform", "translate(40,0)");




        var layout = d3.layout.tree()
            .size([+height(), +width()/2]);

        var diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        var nodes = layout.nodes(data),
            links = layout.links(nodes);

        var link = g.selectAll("path.link")
            .data(links)
            .enter().append("path")
                .attr("class", "link")
                .style("fill","none")
                .style("stroke","#cccccc")
                .style("stroke-width","1px")
                .attr("d", diagonal);

        var node = g.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

        

        node.append("text")
            //.attr("dx", function(d) { return d.children ? -8 : -8; })
            .attr("dx", -8 )
            .attr("dy", 3)
            .style("font-size","11px")
            .style("font-family","Arial, Helvetica")
            //.attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .attr("text-anchor", "end" )
            .text(function (d){ return d.name; });

            console.log(xScale("ET: The Extra-Terrestrial"));
        node.each(function (d,i){
        	d3.select(this).selectAll("circle").data(d.xdata).enter()
        	.append("circle")
        	//.attr("r",function (d){ return d.size; })
        	.attr("r",10)
        	.attr("transform", function(d) { return "translate(" + xScale(d.label) + "," + 0 + ")"; })

        	;

        });

        node.append("circle")
            .style("fill", "#eeeeee")
            .style("stroke","#999999")
            .style("stroke-width","1px")
            .attr("r", 4.5);


        // node.append(function (d){
        // 	if (!d.xdata) {
        // 		return "g";
        // 	} else{
        // 		a = document.createElement("g");
        // 		var item = d3.select(a)
        // 		.attr("width", +width() )
        //     .attr("height", +height() );
        // 		d.xdata.forEach(function(xdatum){
        // 			item.append("circle").attr("r",function (datum){ return xdatum.size; });
        // 		});

        // 		return a;
        		
        // 	}

        // 	});
        

	})

})();