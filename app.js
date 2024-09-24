const svgApp = {
    svg: null,
    clickCount: 0,
    maxClicks: 5000,  // Maximum number of simulated clicks
    intervalTime: 9000,  // 1000 ms = 1 second interval
    clickInterval: null,

    init: function() {
        console.log("init called"); 
        const button = document.getElementById('generateButton');
        const clickCountDisplay = document.getElementById('clickCount');
        const toggleAutoClickCheckbox = document.getElementById('toggleAutoClick');

        // Event listener for the checkbox to toggle the auto-click loop
        toggleAutoClickCheckbox.addEventListener('change', this.toggleAutoClick.bind(this));

        // Store references for easy access in other methods
        this.button = button;
        this.clickCountDisplay = clickCountDisplay;
        this.toggleAutoClickCheckbox = toggleAutoClickCheckbox;

        
        this.svg = d3.select("#imageCanvas");

        // Load the background image
        const backgroundImage = this.svg.append("image")
            .attr("xlink:href", "background.png")  // Path to your Krita-exported image
            .attr("width", 1344)
            .attr("height", 768);
        // Load marquee text    
        this.fetchTextLines();   
        this.toggleAutoClickCheckbox.checked = true;  // check the checkbox by default  
        this.toggleAutoClick();  // Start the auto-click loop by default
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
    },

    generateMarquee: function() {
        console.log("generateMarquee called");  
    
        // Increment the click count when the button is pressed
        this.clickCount++;
        this.clickCountDisplay.textContent = this.clickCount;  // Update the displayed count
    
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
        if (this.clickCount < this.maxClicks) {
            this.clickCount++;
            this.clickCountDisplay.textContent = this.clickCount;  // Update the displayed count
            this.fetchTextLines();  // Call the function to fetch and update the text lines   
            console.log('Button functionality executed!');

            // Simulate button press visual effect
            this.simulateButtonPress();
        } else {
            clearInterval(this.clickInterval);  // Stop clicking after maxClicks is reached
            this.toggleAutoClickCheckbox.checked = false;  // Uncheck the checkbox when max clicks reached
            clickCount = 0;  // Reset the click count
        }
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
        clearInterval(this.clickInterval);  // Always clear any existing interval
    
        if (this.toggleAutoClickCheckbox.checked) {
            // Start a new automatic "clicking" process if the checkbox is checked
            this.clickInterval = setInterval(this.handleClick.bind(this), this.intervalTime);
        }
        // If the checkbox is unchecked, the interval won't restart, effectively stopping the auto-clicking
    }
    
    
}

window.onload = function() {
    svgApp.init();
};

document.getElementById("generateButton").addEventListener("click", function() {
    svgApp.generateMarquee();  // Generate the marquee content
    svgApp.simulateButtonPress();  // Apply the visual button press effect
});



