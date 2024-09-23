import json

# Specify input and output file paths
input_file = 'text_file.txt'
output_file = 'text-lines.json'

# Read the text file, stripping any extra newlines
with open(input_file, 'r') as file:
    lines = [line.strip() for line in file.readlines()]

# Create a dictionary with 'lines' as the key and the list of lines as the value
output_data = {
    "lines": lines
}

# Convert the dictionary into a JSON string
json_output = json.dumps(output_data, indent=4)

# Write the JSON data to the output file
with open(output_file, 'w') as file:
    file.write(json_output)

print(f"JSON with named array 'lines' written to {output_file}")
