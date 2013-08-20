#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd $SCRIPTPATH
cat notes/*.html > all.html
tidy -im -quiet -asxhtml -utf8 -numeric --show-warnings false --tidy-mark no --doctype omit --wrap 0 all.html
basexgui
