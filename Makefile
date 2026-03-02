

ruff:
    ruff check .
    ruff check . --fix
    ruff format .

bandit:
    bandit -r .    #recursively scan an entire file


vulture :
		vulture .    #find dead code

Mimesis:
		mimesis check .  # enables one to generate all kind of data

PySnooper:
		pysnooper test.py  #debugging tool
