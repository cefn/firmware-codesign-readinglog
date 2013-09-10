#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
FILE=$(cat /proc/"$(xdotool getwindowpid $(xdotool getwindowfocus))"/cmdline | xargs -0 echo | grep --text --only-matching --extended-regexp '/.*.pdf$')
log_paper.sh -y "$FILE"
