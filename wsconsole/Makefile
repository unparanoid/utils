PKG:=upd.util.wsconsole
FILES:=  \
	app.html  \
	legal/destyle.css.txt  \
	legal/msgpack-lite.txt  \
	upd.yml

include ../Makefile.in

deps:=  \
	src/app.html  \
	src/destyle.css  \
	src/main.js  \
	src/msgpack.min.js

app.html: $(deps)
	$(HTMLARK) -o $@ $<
