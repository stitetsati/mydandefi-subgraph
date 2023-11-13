format:
	./tools/format
check-format:
	./tools/checkFormat
prepare-test:
	NETWORK=goerli python3 ./subgraph.py
prepare-prod:
	NETWORK=mainnet python3 ./subgraph.py
prepare-bsc:
	NETWORK=bsc python3 ./subgraph.py
building-test:
	make prepare-test && graph codegen && graph build
building-prod:
	make prepare-prod && graph codegen && graph build
building-bsc:
	make prepare-bsc && graph codegen && graph build
test:
	npm run test