PKG:=upd.util.wsconsole
FILES:=  \
	upd.yml  \
	app.html

include ../Makefile.in

deps:=  \
	src/app.html  \
	src/destyle.css  \
	src/main.js  \
	src/msgpack.min.js

app.html: $(deps)
	$(HTMLARK) -o $@ $<
