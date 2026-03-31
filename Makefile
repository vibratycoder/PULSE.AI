.PHONY: install run dev web verify

install:
	pip install -r requirements.txt
	cd web && npm install

run:
	python -m backend.main

dev:
	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

web:
	cd web && npm run dev

verify:
	python -m pytest tests/ -v
