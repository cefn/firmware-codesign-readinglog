#!/bin/sh
SCRIPT=`realpath "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
cd "$SCRIPTPATH"
git diff --ext-diff | meld -
