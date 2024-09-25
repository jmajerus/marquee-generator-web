const svgApp = {
    svg: null,
    clickCount: 0,  // Visual counter for each iteration of text lines
    totalIterations: 0,  // Global counter to limit the total number of iterations
    maxIterations: 5000,  // Maximum number of allowed iterations
    intervalTime: 9000,  // 1000 ms = 1 second interval
    clickInterval: null,
    allTextLines: [],  // All possible text lines, loaded from file
    remainingLines: [],  // Remaining lines that haven't been picked yet

    init: function() {
        console.log("init called"); 
        this.svg = d3.select("#imageCanvas");
        // Load the background image
        const backgroundImage = this.svg.append("image")
            .attr("xlink:href", "background.png")  // Path to your Krita-exported image
            .attr("width", 1344)
            .attr("height", 768);

        const button = document.getElementById('generateButton');
        const clickCountDisplay = document.getElementById('clickCount');
        const toggleAutoClickCheckbox = document.getElementById('toggleAutoClick');

        // Event listener for the checkbox to toggle the auto-click loop
        toggleAutoClickCheckbox.addEventListener('change', this.toggleAutoClick.bind(this));

        // Store references for easy access in other methods
        this.button = button;
        this.clickCountDisplay = clickCountDisplay;
        this.toggleAutoClickCheckbox = toggleAutoClickCheckbox;       
  
        // Load marquee text    
        this.loadTextLines();  // Load text lines from file 
        this.toggleAutoClickCheckbox.checked = true;  // check the checkbox by default  
        this.toggleAutoClick();  // Start the auto-click loop by default
    },
    
    // Load text lines from the JSON file
    loadTextLines: function() {
        fetch('text-lines.json')
            .then(response => response.json())
            .then(data => {
                this.allTextLines = data.lines;  // Store all text lines
                this.remainingLines = d3.shuffle([...this.allTextLines]);  // Shuffle the lines initially
                this.fetchTextLines();  // Display the initial set of lines
            })
            .catch(error => console.error('Error fetching text lines:', error));
    },

    
    fetchTextLines: function() {
        console.log("fetchTextLines called");

        // Check if we've reached the maximum number of iterations
        if (this.totalIterations >= this.maxIterations) {
            console.log("Max iterations reached. Stopping...");
            clearInterval(this.clickInterval);  // Stop any auto-clicking
            return;  // Stop further execution
        }

        // If remainingLines is empty, reshuffle allTextLines and reset the visual counter
        if (this.remainingLines.length === 0) {
            this.remainingLines = d3.shuffle([...this.allTextLines]);  // Reshuffle text lines
            this.clickCount = 0;  // Reset the visual counter when all lines are used
            document.getElementById("clickCount").textContent = this.clickCount;  // Update display
        }

        // Increment the visual counter and the total iterations
        this.clickCount++;
        this.totalIterations++;

        // Update the visual counter display
        document.getElementById("clickCount").textContent = this.clickCount;

        // Take the next 5 lines
        const nextLines = this.remainingLines.slice(0, 5);
        this.remainingLines = this.remainingLines.slice(5);  // Remove used lines

        this.updateText(nextLines);  // Update the text on the display
    },

    updateText: function(randomLines) {
        this.svg.selectAll("text").remove();
        this.svg.selectAll("text")
            .data(randomLines)
            .enter()
            .append("text")
            .attr("x", 675)
            .attr("y", function(d, i) { return 188 + i * 52; })
            .attr("font-size", "37px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });
    },    

    generateMarquee: function() {
        console.log("generateMarquee called");  

        // Fetch and update the text lines
        this.fetchTextLines();
        
        // Only reset the timer if the checkbox is checked (i.e., auto-click is enabled)
        if (this.toggleAutoClickCheckbox.checked) {
            clearInterval(this.clickInterval);  // Clear the current interval
            this.clickInterval = setInterval(this.handleClick.bind(this), this.intervalTime);  // Restart the interval
        }
    },
    

    // Handle the "click" logic directly
    handleClick: function() {
        this.fetchTextLines();  // Call the function to fetch and update the text lines   
        // Simulate button press visual effect
        this.simulateButtonPress();
    },

    simulateButtonPress: function() {
        this.button.classList.add('active');  // Add active class for pressed state
    
        // Remove the class after a short delay to mimic the button press release
        setTimeout(() => {
            this.button.classList.remove('active');
        }, 350);  // 350 ms delay for visual effect
    },
    
    // Toggle the auto-click loop on or off
    toggleAutoClick: function() {
        if (this.toggleAutoClickCheckbox.checked) {
            console.log("Auto-click started");
            this.clickInterval = setInterval(this.fetchTextLines.bind(this), 9000);  // Start auto-clicking every 9 seconds
        } else {
            console.log("Auto-click stopped");
            clearInterval(this.clickInterval);  // Stop auto-clicking when the checkbox is unchecked
        }
    }
    
}

window.onload = function() {
    svgApp.init();
};

document.getElementById("generateButton").addEventListener("click", function() {
    svgApp.generateMarquee();  // Generate the marquee content
    svgApp.simulateButtonPress();  // Apply the visual button press effect
});



