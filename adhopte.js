/*
1. parse data -- done
2. filter out attributes -- no of occurences, date_time (extract year), UFO_shape -- done
3. draw axes -- no of occurences, year -- done
4. draw bar chart -- done
5. draw bubble chart -- UFO_shape for period of year -- done
6. draw the line on bubble hover -- done
7. add tooltip to show bubble info -- done
8. Add info on the right - Discription, etc. -- done
9. animate and beautify everything -- done
10. stars should be on the whole page -- done
*/

const width = 1100;
const height = 700;
const margin = 50;
var svg;
var chartDataArr;

$(document).ready(() => {

    d3.csv('ufo_sighting_data.csv', d => {

        d.year = d['Date_time'] ? new Date(d['Date_time'].split(' ')[0].split('/')[2], 0, 1) : 0;
        d.shape = d['UFO_shape'] && d['UFO_shape'] != 'other' && d['UFO_shape'] != 'unknown' ? d['UFO_shape'] : '?';
        return d;

    }).then(data => {

        data.sort((d1, d2) => d1.year.getFullYear() - d2.year.getFullYear());
                
        let chartData = {};
        let startYear = 1900;
        let yearPeriod = 20;

        data.forEach(d => {

            if(d.year.getFullYear() > (startYear+yearPeriod-1)){
                startYear += yearPeriod;
            }

            let key = startYear+'-'+(startYear+yearPeriod-1)+'-'+d.country;
                
            let obj;
            if(chartData[key]){
                obj = chartData[key];
            }else{
                obj = {
                    occurence: 0,
                    shapes: {},
                    country: ''
                }
                chartData[key] = obj;
            }

            //increase occurence
            obj.occurence++;

            //add shapes or increase shapeOccurence
            if(obj.shapes[d.shape]){
                obj.shapes[d.shape]++;
            }else{
                obj.shapes[d.shape] = 1;
            }

            //add country
            obj.country = d.country;
        });

        chartDataArr = [];

        for (const key in chartData) {
            if (Object.prototype.hasOwnProperty.call(chartData, key)) {
                const element = chartData[key];
                let shapesArr = [];
                for (const shapeKey in element.shapes) {
                    if (Object.prototype.hasOwnProperty.call(element.shapes, shapeKey)) {
                        const shapeElement = element.shapes[shapeKey];
                        let shapeObj = {
                            shape: shapeKey,
                            shapeOccurence: shapeElement
                        }
                        shapesArr.push(shapeObj);
                    }
                }
                let yearKey = key.split('-')[0]+'-'+key.split('-')[1];
                let obj = {
                    year: yearKey,
                    occurence: element.occurence,
                    shapes: shapesArr,
                    country: element.country ? element.country : 'x'
                }
                chartDataArr.push(obj);
            }
        }

        // Create svg tag
        svg = d3.select('#customViz');
        
        initChartInfo();
        drawChart();

    });
});

function initChartInfo(){

    //info box
    svg.append('rect')
        .attr('x', '78%')
        .attr('y', 0)
        .attr('width', '22%')
        .attr('height', height+margin*3)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    svg.append("text")
        .attr("x", "83%")
        .attr("y", 30)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("UFO Sightings")
        .attr('fill', 'white');

    // Add dropdown
    svg.append("text")
        .attr("x", "79%")
        .attr("y", 70)
        .text("Country:")
        .attr('fill', 'white');

    const optionsData = [
        { value: "ALL", text: "ALL" },
        { value: "us", text: "United States" },
        { value: "ca", text: "Canada" },
        { value: "gb", text: "Great Britain" },
        { value: "au", text: "Australia" },
        { value: "de", text: "Germany" },
        { value: "x", text: "Unknown" }
    ];
    
    let dropdown = svg.append("foreignObject")
        .attr("x", "84%")  
        .attr("y", 50)
        .attr("width", 150)
        .attr("height", 30)
        .append("xhtml:select")
            .attr("id", "countrySelect")
            .style("background-color", "transparent") 
            .style("color", "white") 
            .style("border", "1px solid #ccc") 
            .style("padding", "5px")
            .style("font-size", "14px")
            .attr('onchange', 'drawChart()'); 

    // Append the options
    dropdown.selectAll("option")
        .data(optionsData)
        .enter().append("xhtml:option")
        .attr("value", d => d.value)
        .text(d => d.text)
        .attr("selected", d => d.value === "ALL" ? "selected" : null); 

    // Add paragraph
    svg.append("foreignObject")
        .attr("x", "78%") 
        .attr("y", 80)
        .attr("width", '22%')
        .attr("height", height+margin*3)
        .style('padding', '10px')
        .style('text-align', 'justify')

        .append('xhtml:p')
            .style("font-size", "16px")
            .style('font-weight', 'bold')
            .style('color', 'white')
            .text('Description')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('This visualization indicates a trend of sightings of UFOs throughout a century. It showcases a comparison between different shaped UFOs and how their sightings varied across years.')
        
        .append('xhtml:p')
            .style("font-size", "16px")
            .style('color', 'white')
            .style('font-weight', 'bold')
            .text('Marks and Channels')
            .style('padding-top', '10px')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('This visualization is created using Line, Path, and Circle. And these marks are enchanced by the visual channels, including')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('> Lollipop: to show the number of sightings of UFOs for a specific period of years.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('> Bubbles within UFOs: to indicate the number of sighting w.r.t a period of year.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('> Bubble Color: to indicate different shapes.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('> Bubble Radius: to show that varying number of sighting of different shapes.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('font-weight', 'normal')
            .style('color', 'white')
            .text('> Logrithmic X-axis: to fit a long range of values.')

        .append('xhtml:p')
            .style("font-size", "16px")
            .style('font-weight', 'bold')
            .style('color', 'white')
            .text('Interactions')
            .style('padding-top', '10px')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('color', 'white')
            .style('font-weight', 'normal')
            .text('> Change country from the dropdown.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('color', 'white')
            .style('font-weight', 'normal')
            .text('> Hover on the lollipop to view sightings.')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('color', 'white')
            .style('font-weight', 'normal')
            .text('> Hover over the inner bubble to view the shape and sightings of similar bubbles.')

        .append('xhtml:p')
            .style("font-size", "16px")
            .style('font-weight', 'bold')
            .style('color', 'white')
            .style('padding-top', '10px')
            .text('Custom Viz Category')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('color', 'white')
            .style('font-weight', 'normal')
            .text('Combinatorial: because this visualization is a combination of a Lollipop, Line, and Bubble plots.')

        .append('xhtml:p')
            .style("font-size", "16px")
            .style('font-weight', 'bold')
            .style('color', 'white')
            .style('padding-top', '10px')
            .text('Transitions')
        .append("xhtml:p")
            .style("font-size", "14px")
            .style('color', 'white')
            .style('font-weight', 'normal')
            .text('An interesting transition, beside all the regular ones which are included in the chart, the UFOs arrive to their spot from a random location, and goes away on the top left side, imitating an actual UFO.')

}

function drawChart(){

    let selectedCountry = $('#countrySelect')[0].value;
    let localChartDataArr;

    if(selectedCountry === 'ALL'){
        //group count into year period

        let yearMap = new Map();
        chartDataArr.forEach(d => {
            if(yearMap.has(d.year)){
                let obj = yearMap.get(d.year);
                obj.occurence += d.occurence;
                d.shapes.forEach(s => {
                    if(obj.shapesMap.has(s.shape)){
                        obj.shapesMap.set(s.shape, obj.shapesMap.get(s.shape)+s.shapeOccurence);
                    }else{
                        obj.shapesMap.set(s.shape, s.shapeOccurence);
                    }
                });
            }else{
                let obj = {};
                obj.year = d.year;
                obj.occurence = d.occurence;
                obj.country = d.country;
                obj.shapesMap = new Map(d.shapes.map(s => [s.shape, s.shapeOccurence]));
                obj.shapes = [];
                yearMap.set(d.year, obj);
            }
        });

        localChartDataArr = Array.from(yearMap.values());

        localChartDataArr.forEach(d => {
            d.shapesMap.forEach((sValue, sKey) => {
                d.shapes.push({
                    shape: sKey,
                    shapeOccurence: sValue,
                    year: d.year,
                    occurence: d.occurence
                })
            });
        });

    }else{
        //filter data based on selected country
        localChartDataArr = chartDataArr.filter(d => d.country === selectedCountry);

        localChartDataArr.forEach(d => {
            d.shapes.forEach(s => {
                s.occurence = d.occurence,
                s.year = d.year
            });
        });
    }

    const numberOfStars = 300;

    // Append the filter definition to the SVG
    if(!svg.select('defs')){
        svg.append('defs')
            .append('filter')
            .attr('id', 'glow')
            .append('feGaussianBlur')
            .attr('stdDeviation', '6')
            .attr('result', 'coloredBlur');

        svg.select('defs filter')
            .append('feMerge')
            .selectAll('feMergeNode')
            .data(['coloredBlur', 'SourceGraphic'])
            .enter()
            .append('feMergeNode')
            .attr('in', d => d);
    }

    function generateStars() {
        const stars = [];
        for (let i = 0; i < numberOfStars; i++) {
            stars.push({
                x: Math.random() * 2300,         
                y: Math.random() * height,        
                r: Math.random() * 2 + 1,         
                opacity: Math.random() * 0.3 + 0.3 
            });
        }
        return stars;
    }
    
    // Append random stars to the SVG
    svg.selectAll("circle.star")
        .data(generateStars())
        .enter().append("circle")
        .attr("class", "star")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .style("fill", "white")
        .attr('filter', 'url(#glow)')
        .style("opacity", d => d.opacity);

    // Create y-axis
    let y = d3.scaleBand()
        .domain(localChartDataArr.map(d => d.year))
        .range([height - margin, margin*2]);

    let gYAxis = svg.selectAll('.gYAxis').data([0]);

    gYAxis.enter()
        .append('g')
        .attr("class", "gYAxis")
        .attr('transform', `translate(${margin*3}, 0)`)
        .merge(gYAxis)
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y))
        .selectAll("text")
            .style('fill', 'white');

    svg.append('text')
        .text('Year')
        .attr('transform', `translate(${margin+20}, ${height/2}), rotate(-90)`)
        .attr('text-anchor', 'middle')
        .style('fill', 'white');

    // Create x-axis
    let occurenceArr = localChartDataArr.map(d => d.occurence);
    let x = d3.scaleLog()
        .domain([Math.max(1, d3.min(occurenceArr) - 3), d3.max(occurenceArr)*1.5])
        .range([margin*3, width]);

    let gXAxis = svg.selectAll('.gXAxis').data([0]);

    gXAxis.enter()
        .append('g')
        .attr("class", "gXAxis")
        .attr('transform', `translate(0, ${height - margin})`)
        .merge(gXAxis)
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickFormat(d3.format("~s")))
        .selectAll("text")
            .style('fill', 'white')
            .attr("transform", "rotate(-90) translate(-30, -13)")
            .style("text-anchor", "start"); 

    svg.append('text')
        .text('Sighting Count')
        .attr('x', width/2)
        .attr('y', height+20)
        .attr('text-anchor', 'middle')
        .style('fill', 'white');

    // Style the axis lines and ticks
    svg.selectAll(".gYAxis path, .gXAxis path, .gYAxis line, .gXAxis line")
        .style("stroke", "white");

    //bar chart
    let ufoBar = svg.selectAll('.ufoBar')
        .data(localChartDataArr);

    ufoBar.enter()
        .append('line')
        .merge(ufoBar)
            .attr('class', 'ufoBar')
            .attr('stroke', '#D0D0D0')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('transform', `translate(0, ${y.bandwidth() / 2})`) 
            .transition()
            .duration(2500)
            .attr('x1', margin * 3) 
            .attr('y1', d => y(d.year))
            .attr('y2', d => y(d.year))
            .attr('x2', d => x(d.occurence));

    ufoBar.exit()
        .transition()
        .duration(2500)
        .attr('x2', margin * 3)  
        .remove();

    //lollipop on bar chart
    let ufoLollipop = svg.selectAll('.ufoLollipop')
        .data(localChartDataArr);

    ufoLollipop.enter()
        .append('circle')
        .merge(ufoLollipop)
            .attr('class', 'ufoLollipop')
            .style("fill", "white")
            .style("fill-opacity", 1)
            .style("stroke", '#D0D0D0')
            .style("stroke-width", 2)
            .attr('transform', `translate(0, ${y.bandwidth() / 2})`) 
            .attr('value', d => d.occurence)
            .on('mouseover', function(event) {
                svg.selectAll('.tooltip-box').remove();   
                svg.selectAll('.tooltip-text').remove(); 
                let element = event.target;
                let count = element.getAttribute('value');
                let cx = parseFloat(element.getAttribute('cx'));
                let cy = parseFloat(element.getAttribute('cy'));
                let transform = element.getAttribute("transform");

                // Extract translation values from transform string (e.g., "translate(100, 200)")
                let translate = transform.match(/translate\(([^,]+),([^)]+)\)/);
                let tx = translate ? parseFloat(translate[1]) : 0;
                let ty = translate ? parseFloat(translate[2]) : 0;

                let tooltipData = {
                    x: cx+tx,
                    y: cy+ty
                }

                svg.append("rect")
                .datum(tooltipData)
                    .attr("class", 'tooltip-box')
                    .attr("width", 120) 
                    .attr("height", 20) 
                    .attr("rx", 10)     
                    .attr("ry", 10)
                    .style("fill", "white")
                    .style("stroke", '#D0D0D0')
                    .style("stroke-width", 2)
                    .style("position", "absolute")
                    .style("background-color", "#f8f9f9")
                    .style("padding", "5px")
                    .attr('x', d => d.x+5)
                    .attr('y', d => d.y-15);

                svg.append("text")
                .datum(tooltipData)
                        .attr("class", 'tooltip-text')
                        .style("font-size", "12px")
                        .style("fill", "black")
                        .attr('x', d => d.x+10)
                        .attr('y', d => d.y)
                        .html(`<tspan>Sightings: ${count}<tspan/>`);

            })
            .on('mouseout', function() {
                svg.selectAll('.tooltip-box').remove();   
                svg.selectAll('.tooltip-text').remove(); 
            })
            .transition()
            .duration(2500)
            .attr("r", 6)
            .attr("cy", d => y(d.year))
            .attr('cx', d => x(d.occurence));

    ufoLollipop.exit()
        .transition()
        .duration(2500)
        .attr('cx', margin * 3)  
        .remove();

    let shapesMap = new Map();
    localChartDataArr.map(d => d.shapes).flat().forEach(d => {
        let key = d.shape+'-'+d.year;
        if(shapesMap.has(key)){
            shapesMap.get(key).shapeOccurence += d.shapeOccurence;
        }else{
            shapesMap.set(key, d);
        }
    });

    let shapesData = Array.from(shapesMap.values());

    // Create color scale for shapes
    const shapeColors = d3.scaleOrdinal()
        .domain(shapesData.map(d => d.shape))
        .range(d3.schemePaired);

    // Group the data by year
    const shapesByYear = d3.group(shapesData, d => d.year);

    // Create pack layout
    const pack = d3.pack()
        .size([110, 70]) 
        .padding(3);

    // Create hierarchies for each year
    const yearHierarchies = Array.from(shapesByYear, ([year, shapes]) => {
        return {
            year: year,
            hierarchy: d3.hierarchy({children: shapes})
                .sum(d => d.shapeOccurence)
                .sort((a, b) => b.value - a.value)
        };
    });

    // Apply pack layout to each hierarchy
    const packedYears = yearHierarchies.map(({year, hierarchy}) => ({
        year: year,
        packed: pack(hierarchy)
    }));

    const allBubbles = packedYears.flatMap(d => 
        d.packed.leaves().map(leaf => ({
            ...leaf.data,
            parentYear: d.year,
            parentX: d.packed.x,
            parentY: d.packed.y,
            r: leaf.r
        }))
    );

    // Create a group for each year
    const yearGroups = svg.selectAll(".year-group")
        .data(packedYears);

    let yearGroupsEnter = yearGroups.enter().append("g")
        .attr("class", "year-group")
        .attr('transform', () => {
            const offScreenMargin = 100;
    
            const side = Math.floor(Math.random() * 4); 
            let x, y;
    
            switch (side) {
                case 0: // Top edge
                    x = Math.random() * width;
                    y = -offScreenMargin;
                    break;
                case 1: // Right edge
                    x = width + offScreenMargin;
                    y = Math.random() * height;
                    break;
                case 2: // Bottom edge
                    x = Math.random() * width;
                    y = height + offScreenMargin;
                    break;
                case 3: // Left edge
                    x = -offScreenMargin;
                    y = Math.random() * height;
                    break;
            }
    
            return `translate(${x}, ${y})`;
        });

    // Create simulation for UFO groups
    const ufoSimulation = d3.forceSimulation(packedYears)
        .force("x", d3.forceX(d => x(d.packed.data.children[0].occurence)).strength(0.05))
        .force("y", d3.forceY(d => y(d.year)).strength(0.05))
        .force("charge", d3.forceManyBody().strength(0.05))
        .force("collide", d3.forceCollide(d => d.packed.r + 10).strength(0.05))
        .alpha(0.5)
        .alphaDecay(0.005)
        .on("tick", ticked);
    
    // Create simulation for inner bubbles
    const bubbleSimulation = d3.forceSimulation(allBubbles)
        .force("x", d3.forceX(d => 0).strength(0.05))
        .force("y", d3.forceY(d => 0).strength(0.05))
        .force("charge", d3.forceManyBody().strength(0.05))
        .force("collide", d3.forceCollide(d => d.r * 0.8).strength(0.05))
        .alpha(0.5)
        .alphaDecay(0.005);

    function ticked() {
        
        // Update bubble simulation center based on UFO positions
        bubbleSimulation.force("x", d3.forceX(d => {
            const parent = packedYears.find(p => p.year === d.parentYear);
            return parent ? parent.x - d.parentX : 0;
        }).strength(0.05));

        bubbleSimulation.force("y", d3.forceY(d => {
            const parent = packedYears.find(p => p.year === d.parentYear);
            return parent ? parent.y - d.parentY : 0;
        }).strength(0.05));
    }   

    // Add the containing circle for each year
    yearGroupsEnter.append("ellipse")
        .attr("rx", d => d.packed.r * 1.5)
        .attr("ry", d => d.packed.r * 0.8)
        .attr("cy", d => d.packed.r * 0.2)
        .style("fill", "#f8f9f9")  
        .style("stroke", "#808080")
        .style("fill-opacity", 0.5)
        .style("stroke-width", 2);

    // Add a "dome" to the UFO
    yearGroupsEnter.append("path")
        .attr("d", d => {
            const rx = d.packed.r * 1;
            const ry = d.packed.r * 1;
            return `M${-rx},0 A${rx},${ry} 0 0,1 ${rx},0`;
        })
        .attr("transform", d => `translate(0,${-d.packed.r * 0.1})`)
        .style("fill", "##f8f9f9")  
        .style("stroke", "#808080")
        .style("fill-opacity", 0.5)
        .style("stroke-width", 1);

    let yearGroupsUpdated = yearGroupsEnter.merge(yearGroups);

    // Add the bubbles for each shape within the year
    yearGroupsUpdated.selectAll('[class*="shape-bubble-"]')
        .data(d => d.packed.leaves())
        .enter().append("circle")
        .attr("class", d => "shape-bubble-"+d.data.shape)
        .style("fill", d => shapeColors(d.data.shape))
        .style("fill-opacity", 1)
        .attr("stroke", "white")
        .style("stroke-width", 1)
        .attr('value', d => d.data.shapeOccurence)
        .on('mouseover', function(event) {
            svg.selectAll('.shape-connection').remove();   
            svg.selectAll('.tooltip-box').remove();   
            svg.selectAll('.tooltip-text').remove(); 
            let className = event.target.className.baseVal || event.target.className;
            let hoveredBubbleShape = className.split('-')[2];
            let bubbles = document.getElementsByClassName(className);
            let lineData = [];
            let lineColor = 'black';
            let i=0;
            for (const element of bubbles) {
                // Get cx and cy relative to parent <g> group
                let cx = parseFloat(element.getAttribute('cx'));
                let cy = parseFloat(element.getAttribute('cy'));
                let transform = element.parentNode.getAttribute("transform");
                const circleColor = window.getComputedStyle(element).fill;

                // Extract translation values from transform string (e.g., "translate(100, 200)")
                let translate = transform.match(/translate\(([^,]+),([^)]+)\)/);
                let tx = translate ? parseFloat(translate[1]) : 0;
                let ty = translate ? parseFloat(translate[2]) : 0;

                // Calculate absolute x and y by adding translation values
                lineData.push({
                    x: cx + tx,
                    y: cy + ty,
                    occurence: element.getAttribute('value')
                });

                if (i === 0 && circleColor) {
                    lineColor = circleColor;
                }
                i++;
            }
            svg.append("path")
                .datum(lineData)
                .attr('class', 'shape-connection')
                .attr('fill', 'none')
                .attr('stroke', lineColor)
                .attr('stroke-width', 3)
                .attr('filter', 'url(#glow)')
                .attr("d", d3.line()
                    .x(d => d.x)
                    .y(d => d.y)
                    .curve(d3.curveCatmullRom.alpha(0.5)) 
                )

            svg.selectAll('tooltip-box')
                .data(lineData)
                .enter()
                .append("rect")
                    .attr("class", 'tooltip-box')
                    .attr("width", 120)  // Set width of tooltip box
                    .attr("height", 40)  // Set height of tooltip box
                    .attr("rx", 10)      // Rounded corners
                    .attr("ry", 10)
                    .style("fill", "white")
                    .style("stroke", lineColor)
                    .style("stroke-width", 2)
                    .style("position", "absolute")
                    .style("background-color", "#f8f9f9")
                    .style("padding", "5px")
                    .attr('x', d => d.x+5)
                    .attr('y', d => d.y+15);

            svg.selectAll('tooltip-text')
                .data(lineData)
                .enter()
                .append("text")
                    .attr("class", 'tooltip-text')
                    .style("font-size", "12px")
                    .style("fill", "black")
                    .attr('x', d => d.x+10)
                    .attr('y', d => d.y+30)
                    .html(d => `<tspan>Shape: ${hoveredBubbleShape}<tspan/> <tspan x="${d.x+10}" dy="1.2em">Sightings: ${d.occurence}<tspan/>`);

            let allBubbles = document.querySelectorAll('[class*="shape-bubble-"]');
            for (const element of allBubbles) {
                let classShape = element.getAttribute('class').split('-')[2];
                if(classShape == hoveredBubbleShape){
                    element.style.opacity = 1;
                }else{
                    element.style.opacity = 0.2;
                }
            }
        })
        // Remove line when mouse leaves bubble area
        .on('mouseout', function() {
            svg.selectAll('.shape-connection').remove();   
            svg.selectAll('.tooltip-box').remove();   
            svg.selectAll('.tooltip-text').remove();   
            let allBubbles = document.querySelectorAll('[class*="shape-bubble-"]');
            for (const element of allBubbles) {
                element.style.opacity = 1;
            }
        });
    
    yearGroupsUpdated.transition()
        .duration(2000) 
        .attr('transform', (d) => `translate(${x(d.packed.data.children[0].occurence)-50}, ${y(d.year)+10})`);
     
    yearGroupsUpdated.selectAll('[class*="shape-bubble-"]')
        .transition()
        .duration(2000) 
        .attr("r", d => d.r * 0.8)
        .attr("cy", d => ((d.y - d.parent.y) * 0.8 + d.parent.r * 0.2))
        .attr('cx', (d) => (d.x - d.parent.x));

    yearGroups.exit()
        .transition()
        .duration(2500)
        .attr('transform', `translate(-100, -100)`)
        .remove();
    
    yearGroups.selectAll('[class*="shape-bubble-"]').exit()
        .transition()
        .duration(2500)
        .attr('r', `0`)
        .remove();
}