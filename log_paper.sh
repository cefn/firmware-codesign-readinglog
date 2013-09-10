#!/bin/bash
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`

# check if forced
if [ "$1" == "-y" ] 
	then
		ASK=0
		shift
	else
		ASK=1
fi

FILE=`realpath "$1"`
evince "$FILE" &
disown

cd "$SCRIPTPATH"

# generate title information and query user
TITLE=`java -jar docears-pdf-inspector.jar -title "$FILE"`

# workaround to force Zenity to appear on top
WINDOWID=
# ask user to log or not
if [ $ASK -eq 0 ] || zenity --question --text="Log $TITLE for PhD?" 
	then
		# user wants this document to be logged
		  
		# figure out unique identifier and reading log file for the document
		HASH=`md5sum "$FILE" | cut -d " " -f1`
		BACKUPFILE="papers/${HASH}.pdf"
		LOGFILE="notes/${HASH}.html"
		  
		cp "$FILE" "$BACKUPFILE"

		# create log file if it doesn't exist, expanding BASH variables inline
		if [ ! -f "$LOGFILE" ]; then
		  echo "Creating new log file $LOGFILE"
		  echo $(eval echo $(cat notes_template.html)) >> "$LOGFILE"
		fi

		# load the log file for editing
		bluegriffon "`realpath $LOGFILE`" &
		disown    
fi
