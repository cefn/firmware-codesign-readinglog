#!/bin/sh
# depends on previous apt-get installation of 'xdotool'
QUERY="getwindowfocus"
#QUERY="search landscapes"
#QUERY="search PDC2010"
#QUERY="search bf19"
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
# makes sure that papers/xxx.pdf references are valid
cd "$SCRIPTPATH"
FILE=$(cat /proc/"$(xdotool getwindowpid $(xdotool ${QUERY} 2>&1 |tail -n1))"/cmdline | xargs -0 echo | grep --text --only-matching --extended-regexp '.*/.*.pdf$' | sed 's/\.*evince //g')
log_paper.sh -y "$FILE"
