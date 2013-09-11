
build: less

less: static/project_config.css

static/project_config.css: static/project_config.less
	./node_modules/.bin/lessc $< > $@
