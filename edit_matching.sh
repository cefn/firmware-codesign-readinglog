#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
SEARCH=$1
for MATCH in $( grep -rnl "$SEARCH" notes/*.html )
do
	FILE=$( realpath "$MATCH" )
	bluegriffon "$FILE"
done
