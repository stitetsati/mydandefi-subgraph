format:
	./tools/format
check-format:
	./tools/checkFormat
prepare:
	python3 ./subgraph.py
build:
	graph codegen && graph build
test:
	npm run test