#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
FILEID=$(xdotool search --name "logx" | tail -n1 | xargs -n1 xdotool getwindowname | grep --text --only-matching --perl-regexp '(?<=/)[^/]*(?=\.html)' )
evince "papers/$FILEID.pdf"
