const svgApp = {
    svg: null,

    init: function() {
        console.log("init called");  
        this.svg = d3.select("#imageCanvas");

        // Load the background image
        const backgroundImage = this.svg.append("image")
            .attr("xlink:href", "background.png")  // Path to your Krita-exported image
            .attr("width", 1344)
            .attr("height", 768);
    
    },

    fetchTextLines: function() {
        console.log("fetchTextLines called");  // Logs when the function is executed
        const svgElement = document.querySelector("svg");
        console.log(svgElement);  // Logs the SVG element to see if it's being selected
        fetch('text-lines.json')
            .then(response => response.json())
            .then(data => {
                const randomLines = d3.shuffle(data.lines).slice(0, 5);
                this.updateText(randomLines);
            })
            .catch(error => console.error('Error fetching text lines:', error));
    },

    updateText: function(randomLines) {
        this.svg.selectAll("text").remove();
        this.svg.selectAll("text")
            .data(randomLines)
            .enter()
            .append("text")
            .attr("x", 675)
            .attr("y", (d, i) => 188 + i * 52)
            .attr("font-size", "39px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text(d => d);
    }
    
}

window.onload = function() {
    svgApp.init();
};

document.getElementById("generateButton").addEventListener("click", function() {
    svgApp.fetchTextLines();  // Use a regular function as a fallback
});


