#!/bin/sh
# depends on previous apt-get installation of 'xdotool'
#QUERY="getwindowfocus"
QUERY="getactivewindow"
#QUERY="search PDC2010"
#QUERY="search bf19"
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
# makes sure that papers/xxx.pdf references are valid
cd "$SCRIPTPATH"
FILE=$(ps -o args -p "$(xdotool getwindowpid $(xdotool ${QUERY} 2>&1 |tail -n1))" | grep --text --only-matching --extended-regexp '.*pdf$' | sed -r 's/.*evince\s?//g')
zenity --warning --text="${FILE}"
log_paper.sh -y "$FILE"
