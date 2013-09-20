#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
FROMDIR="../notes/"
TODIR="../scripts/server/public/notes/"
cd "$SCRIPTPATH"
mkdir -p ${TODIR}
rsync --exclude=".gitignore" --recursive --whole-file ${FROMDIR} ${TODIR}
tidy -im -quiet -asxhtml -numeric  --input-encoding win1252 --output-encoding utf8 --indent yes --vertical-space no --show-warnings false --tidy-mark no --drop-empty-paras no --enclose-text yes --doctype omit --wrap 80 ${TODIR}*.html
