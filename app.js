console.log("JavaScript is running");  // First line in app.js

const svgApp = {
    svg: null,
    groupIndex: 0,  // Visual counter for each iteration of text lines
    currentIndex: 0,  // Index to keep track of the current line
    totalIterations: 0,  // Global counter to limit the total number of iterations
    maxIterations: 5000,  // Maximum number of allowed iterations
    intervalTime: 7500,  // 1000 ms = 1 second interval
    advanceInterval: null,
    allTextLines: [],  // All possible text lines, loaded from file


    init: function() {
        console.log("init called"); 
        this.svg = d3.select("#imageCanvas");
    
        // Load the background image
        const backgroundImage = this.svg.append("image")
            .attr("xlink:href", "background.png")  
            .attr("width", 1344)
            .attr("height", 768);
    
        const button = document.getElementById('generateButton');
        const groupIndexDisplay = document.getElementById('groupIndexDisplay');
        const toggleAutoAdvanceCheckbox = document.getElementById('toggleAutoAdvanceCheckbox');
    
        console.log("attaching button listeners"); 
        // Attach button event listener here (inside the object)
        button.addEventListener("click", () => {
            this.handleManualClick();  // Generate the marquee content
            this.simulateButtonPress();  // Apply the visual button press effect
        });
    
        console.log("attaching checkbox event listener"); 
        // Event listener for the checkbox to toggle the auto-click loop
        toggleAutoAdvanceCheckbox.addEventListener('change', this.toggleAutoAdvance.bind(this));
 
    
        // Attach keyboard event listener for arrow key navigation
        console.log("attaching keydown event listener"); 
        document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
        // Store references for easy access in other methods
        this.button = button;
        this.groupIndexDisplay = groupIndexDisplay;
        this.toggleAutoAdvanceCheckbox = toggleAutoAdvanceCheckbox;       
    
        // Load marquee text    
        console.log("Calling loadTextLines()");
        this.loadTextLines();  // Load text lines from file 
        this.toggleAutoAdvanceCheckbox.checked = true;  // Check the checkbox by default  
        this.toggleAutoAdvance();  // Start the auto-click loop by default
        // Check if auto-advance is enabled and start the timer if it is
        //this.startAutoAdvance();  // Start the timer
    },

    startAutoAdvance: function() {
        clearInterval(this.autoAdvanceInterval);  // Clear any existing interval
        this.autoAdvanceInterval = setInterval(() => {
            this.incrementGroupIndex(1);  // Auto-advance the groupIndex
            this.fetchTextLines();        // Fetch the next lines
        }, this.intervalTime);
    },  
    
    // Load text lines from the JSON file
    loadTextLines: function() {
        fetch('text-lines.json')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched text lines:', data.lines);  // Log fetched lines
                this.allTextLines = d3.shuffle([...data.lines]);  // Shuffle the text lines and store them
                this.groupIndex = 0;  // Reset the index to 0
                this.fetchTextLines();  // Display the first set of shuffled lines
            })
            .catch(error => console.error('Error fetching text lines:', error));
    },
    
    fetchTextLines: function() {
        const startIndex = this.groupIndex * 5;  // Get the start index based on groupIndex
        const nextLines = this.allTextLines.slice(startIndex, startIndex + 5);  // Slice lines directly from allTextLines
    
        console.log("Fetching text lines. Group index:", this.groupIndex);
        console.log("Next lines to display:", nextLines);  // Log the lines to display
    
        this.svg.selectAll("text").remove();  // Clear existing text
        this.svg.selectAll("text")
            .data(nextLines)
            .enter()
            .append("text")
            .attr("x", 675)
            .attr("y", function(d, i) { return 188 + i * 52; })
            .attr("font-size", "38px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });
    },
    
    handleManualClick: function() {
        console.log("Manual button click");
        this.incrementGroupIndex(1);  // Increment by 1 on button click
        this.fetchTextLines();  // Manually trigger the text update
     
        // Debounce the auto-click interval by resetting the timer
        if (this.toggleAutoAdvanceCheckbox.checked) {
            clearInterval(this.advanceInterval);  // Clear the current interval
            this.advanceInterval = setInterval(this.handleManualClick.bind(this), this.intervalTime);  // Restart the interval
        }
    },
    
    simulateButtonPress: function() {
        this.button.classList.add('active');  // Add active class for pressed state
    
        // Remove the class after a short delay to mimic the button press release
        setTimeout(() => {
            this.button.classList.remove('active');
        }, 350);  // 350 ms delay for visual effect
    },

    incrementGroupIndex: function(amount) {
        const numberOfGroups = Math.ceil(this.allTextLines.length / 5);  // Calculate total groups based on allTextLines
        this.groupIndex += amount;

        // Ensure it wraps around correctly
        if (this.groupIndex >= numberOfGroups) {
            this.groupIndex = 0;  // Loop back to the first group
        } else if (this.groupIndex < 0) {
            this.groupIndex = numberOfGroups - 1;  // Loop back to the last group
        }
        // Update the groupIndex display after incrementing/decrementing
        this.groupIndexDisplay.textContent = this.groupIndex + 1;  // Display 1-based index to user
        console.log("Updated groupIndex:", this.groupIndex);  // Log the updated groupIndex
    },

    handleKeyNavigation: function(event) {
        if (event.key === 'ArrowRight') {
            this.incrementGroupIndex(1);  // Increment by 1 for right arrow key
            this.fetchTextLines();
        }
    
        if (event.key === 'ArrowLeft') {
            this.incrementGroupIndex(-1);  // Decrement by 1 for left arrow key
            this.fetchTextLines();
        }
    
        // Debounce the auto-click interval by resetting the timer
        if (this.toggleAutoAdvanceCheckbox.checked) {
            clearInterval(this.advanceInterval);  // Clear the current interval
            this.advanceInterval = setInterval(this.handleManualClick.bind(this), this.intervalTime);  // Restart the interval
        }
    },
    
    // Toggle the auto-click loop on or off
    toggleAutoAdvance: function() {
        if (this.toggleAutoAdvanceCheckbox.checked) {
            this.startAutoAdvance();  // Start the auto-advance timer
        } else {
            clearInterval(this.autoAdvanceInterval);  // Stop the timer if unchecked
        }
    }
    
}

window.onload = function() {
    console.log("Window loaded. Calling svgApp.init()");
    svgApp.init();  // Ensure init is called after the window is fully loaded
};



