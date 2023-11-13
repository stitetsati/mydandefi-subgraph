import json
import os

# Load the deployment.json file
with open('deployment.json', 'r') as f:
    deployment_data = json.load(f)

# Check the NETWORK environment variable
NETWORK = os.environ.get('NETWORK')
if NETWORK not in ['mainnet', 'goerli', 'bsc']:
    print("Error: NETWORK must be 'mainnet' or 'goerli'")
    exit(1)

# Load the subgraph.yaml content
with open('subgraph-template.yaml', 'r') as f:
    subgraph_content = f.read()

# Replace placeholders in subgraph_content based on deployment_data and NETWORK
for key, values in deployment_data.items():
    value = str(values[NETWORK])
    subgraph_content = subgraph_content.replace(f"${{{key}}}", value)

# Save the modified content to subgraph_{NETWORK}.yaml
output_file = f"subgraph.yaml"
with open(output_file, 'w') as f:
    f.write(subgraph_content)

print(f"File processed successfully and saved to {output_file}.")
