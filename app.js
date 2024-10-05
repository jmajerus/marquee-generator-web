console.log("JavaScript is running");  // First line in app.js

const svgApp = {
    svg: null,
    groupIndex: 0,  
    currentIndex: 0,
    totalIterations: 0,
    maxIterations: 5000,  
    intervalTime: 7500,  
    autoAdvanceInterval: null,
    allTextLines: {},
    currentTopic: "All",  
    topicList: [],
    lastDisplayedTopic: null,
    currentTopicIndex: 0,  
    groupSize: 5,  // Number of text lines per group
    shuffleTopics: true,  // Enable or disable topic shuffling
    shuffleLines: true,  // Enable or disable line shuffling within topics

    init: function() {
        console.log("init called"); 
        this.svg = d3.select("#imageCanvas");

        // Load the background image
        const backgroundImage = this.svg.append("image")
        .attr("xlink:href", "background-image.png")  // Path to your image
        .attr("width", 1344)  // Set width to match SVG canvas
        .attr("height", 768);  // Set height to match SVG canvas

        const button = document.getElementById('generateButton');
        const groupIndexDisplay = document.getElementById('groupIndexDisplay');
        const toggleAutoAdvanceCheckbox = document.getElementById('toggleAutoAdvanceCheckbox');

        console.log("Attaching button listeners");
        button.addEventListener("click", () => {
            this.handleButtonClick();  
        });

        console.log("Attaching checkbox event listener");
        toggleAutoAdvanceCheckbox.addEventListener('change', this.toggleAutoAdvance.bind(this));

        document.addEventListener('keydown', this.handleKeyNavigation.bind(this));

        this.button = button;
        this.groupIndexDisplay = groupIndexDisplay;
        this.toggleAutoAdvanceCheckbox = toggleAutoAdvanceCheckbox;

        console.log("Calling loadTextLines()");
        this.loadTextLines();
        this.toggleAutoAdvanceCheckbox.checked = true;
        this.toggleAutoAdvance();
        this.startAutoAdvance();
    },

    // Load topics and lines, applying line shuffling based on shuffleLines flag
    loadTextLines: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched topics and text lines:', data);  
                this.topicList = Object.keys(data);  // Extract topics

                // Shuffle topics if shuffleTopics is true
                if (this.shuffleTopics) {
                    this.topicList = d3.shuffle([...this.topicList]);
                }

                this.allTextLines = {};
                this.topicList.forEach(topic => {
                    let textLines = Object.keys(data[topic]);  // Get the text lines

                    // Shuffle lines within each topic if shuffleLines is true
                    if (this.shuffleLines) {
                        textLines = d3.shuffle([...textLines]);
                    }

                    this.allTextLines[topic] = textLines;  // Store the shuffled/unshuffled lines
                });

                this.populateTopicSelect();  
                this.fetchTopicLine();  
            })
            .catch(error => console.error('Error fetching topics and text lines:', error));
    },

    // Populate the topic selection dropdown
    populateTopicSelect: function() {
        const topicSelect = document.getElementById('topicSelect');
        topicSelect.innerHTML = `<option value="All">All</option>`;  // Default "All" option

        this.topicList.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });

        // Attach event listener for the dropdown
        topicSelect.addEventListener('change', () => {
            this.currentTopic = topicSelect.value;
            this.groupIndex = 0;  
            this.fetchTopicLine();  
        });
    },

    // Start auto-advancing through the text lines based on the interval time
    startAutoAdvance: function() {
        clearInterval(this.autoAdvanceInterval);  // Clear any existing interval
        this.autoAdvanceInterval = setInterval(() => {
            this.advanceGroupIndex(1);  // Auto-advance the groupIndex
        }, this.intervalTime);
    },

    // Toggle auto-advance on or off based on the checkbox
    toggleAutoAdvance: function() {
        if (this.toggleAutoAdvanceCheckbox.checked) {
            this.startAutoAdvance();  // Start the auto-advance timer
        } else {
            clearInterval(this.autoAdvanceInterval);  // Stop the timer if unchecked
        }
    },

    // Advance the current group of text lines within a topic or across topics
    advanceGroupIndex: function(amount) {
        const currentTopic = this.currentTopic === "All" ? this.getCurrentTopicForAllMode() : this.currentTopic;
        const totalTextLinesForTopic = this.allTextLines[currentTopic].length;
        const numberOfGroups = Math.ceil(totalTextLinesForTopic / this.groupSize);  

        this.groupIndex += amount;

        // Handle "All" mode separately
        if (this.currentTopic === "All") {
            if (this.groupIndex >= numberOfGroups) {
                this.groupIndex = 0;  
                this.advanceTopicIndex(1);  
            } else if (this.groupIndex < 0) {
                this.groupIndex = 0;  
            }
        } else {
            if (this.groupIndex >= numberOfGroups) {
                this.groupIndex = 0;
            } else if (this.groupIndex < 0) {
                this.groupIndex = numberOfGroups - 1;
            }
        }

        this.fetchTopicLine();

        if (this.groupIndexDisplay) {
            this.groupIndexDisplay.textContent = this.groupIndex + 1;
        } else {
            console.error("groupIndexDisplay element is not defined!");
        }

        if (this.toggleAutoAdvanceCheckbox.checked) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = setInterval(this.advanceGroupIndex.bind(this, 1), this.intervalTime);
        }
    },

    // Advance to the next topic in "All" mode
    advanceTopicIndex: function(amount) {
        const topics = this.topicList;
        const totalTopics = topics.length;

        this.currentTopicIndex = (this.currentTopicIndex + amount) % totalTopics;

        if (this.currentTopicIndex < 0) {
            this.currentTopicIndex = totalTopics - 1;  
        }

        this.groupIndex = 0;  
        this.fetchTopicLine();  
    },

    // Fetch the current topic in "All" mode based on current topic index
    getCurrentTopicForAllMode: function() {
        return this.topicList[this.currentTopicIndex];
    },

    // Fetch the text lines for the current topic
    fetchTopicLine: function() {
        let nextLines = [];
        let topicToDisplay = '';

        if (this.currentTopic === "All") {
            topicToDisplay = this.getCurrentTopicForAllMode();
        } else {
            topicToDisplay = this.currentTopic;
        }

        if (this.lastDisplayedTopic !== topicToDisplay) {
            this.displayTopic(topicToDisplay);  
            this.lastDisplayedTopic = topicToDisplay;  
        }

        nextLines = this.getNextLinesForTopic(topicToDisplay);
        this.displayLines(nextLines);  
    },

    // Get the next group of lines within a topic
    getNextLinesForTopic: function(topic) {
        const linesQueue = this.allTextLines[topic];
        const startIndex = this.groupIndex * this.groupSize;
        const endIndex = startIndex + this.groupSize;

        return linesQueue.slice(startIndex, endIndex);  
    },

    // Display the topic title at the top of the SVG canvas
    displayTopic: function(topic) {
        this.svg.selectAll("text.topic").remove();  

        this.svg.append("text")
            .attr("class", "topic")
            .attr("xml:space", "preserve")  // Preserve white spaces
            .attr("x", 675)
            .attr("y", 550)
            .attr("font-size", "42px")
            .attr("fill", "darkred")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("word-spacing", "8px")  // Adjust this for a space and a half
            .text(topic)
            .raise();  
    },

    // Display the group of text lines within a topic
    displayLines: function(nextLines) {
        this.svg.selectAll("text.line").remove();  

        this.svg.selectAll("text.line")
            .data(nextLines)
            .enter()
            .append("text")
            .attr("class", "line")  
            .attr("x", 675)
            .attr("y", (d, i) => 188 + i * 52)
            .attr("font-size", "38px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text(d => d);
    },

    // Simulate button press animation
    simulateButtonPress: function() {
        this.button.classList.add('active');  // Add active class for pressed state
        setTimeout(() => {
            this.button.classList.remove('active');
        }, 250);  // 250 ms delay for visual effect
    },

    // Handle keyboard navigation for advancing text lines
    handleKeyNavigation: function(event) {
        const isCheckboxFocused = document.activeElement === this.toggleAutoAdvanceCheckbox;

        if (event.key === ' ' && isCheckboxFocused) {
            return;  
        }

        if (event.key === 'ArrowRight') {
            this.advanceGroupIndex(1);  
        }

        if (event.key === 'ArrowLeft') {
            this.advanceGroupIndex(-1);  
        }
    }
};

window.onload = function() {
    svgApp.init();  
};
