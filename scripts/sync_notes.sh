#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
mkdir -p ../scripts/server/resources/notes/
rsync --exclude=".gitignore" --recursive --whole-file ../notes/ ../scripts/server/resources/notes/
tidy -im -quiet -asxhtml -numeric  --input-encoding win1252 --output-encoding utf8 --indent yes --vertical-space no --show-warnings false --tidy-mark no --drop-empty-paras no --doctype omit --wrap 80 ../scripts/server/resources/notes/*.html
