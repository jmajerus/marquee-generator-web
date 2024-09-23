const svgApp = {
    svg: null,

    init: function() {
        console.log("init called");  
        this.svg = d3.select("#imageCanvas");

        // Load the background image
        const backgroundImage = svg.append("image")
            .attr("xlink:href", "background.png")  // Path to your Krita-exported image
            .attr("width", 1792)
            .attr("height", 1024);
    
    },

    fetchTextLines: function() {
        console.log("Function called");  // Logs when the function is executed
        const svgElement = document.querySelector("svg");
        console.log(svgElement);  // Logs the SVG element to see if it's being selected
        fetch('text-lines.json')
            .then(response => response.json())
            .then(data => {
                const randomLines = d3.shuffle(data.lines).slice(0, 5);
                updateText(randomLines);
            })
            .catch(error => console.error('Error fetching text lines:', error));
    },

    updateText: function(randomLines) {
        this.svg.selectAll("text").remove();
        this.svg.selectAll("text")
            .data(randomLines)
            .enter()
            .append("text")
            .attr("x", 896)
            .attr("y", (d, i) => 372 + i * 60)
            .attr("font-size", "48px")
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .text(d => d);
    }
    
}

window.onload = function() {
    svgApp.init();
};

document.getElementById("myButton").addEventListener("click", function() {
    svgApp.fetchTextLines();
});


