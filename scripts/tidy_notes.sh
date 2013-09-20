#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
tidy -im -quiet -asxhtml -utf8 -numeric --show-warnings false --tidy-mark no --drop-empty-paras no --doctype omit --wrap 0 ../notes/*.html
