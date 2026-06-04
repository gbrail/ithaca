# To update, we expect that you've checked out v8/node at the path below
#SRC_DIR = $(realpath ../../node)
#TGT_DIR = $(realpath ../nodejs)
SRC_DIR = ../../node
TGT_DIR = ../nodejs

SOURCES = $(shell find $(SRC_DIR)/lib -name \*.js)
SOURCES := $(filter-out %/, $(SOURCES))
TARGETS = $(patsubst $(SRC_DIR)/%, $(TGT_DIR)/%, $(SOURCES))

all: $(TARGET_DIRS) $(TARGETS) 

$(TGT_DIR)/%: $(SRC_DIR)/% babel.config.json
	if [ ! -d `dirname $@` ]; then mkdir `dirname $@`; fi
	npx babel $< > $@
	@[ -s $@ ] || { rm -f $@; exit 1; }


debug:
	@echo "Sources: " $(SOURCES) 
	@echo "Targets: " $(TARGETS) 


