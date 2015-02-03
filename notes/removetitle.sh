#!/bin/bash
# A demonstration of a multiline perl inline substitution
# This was tested...
# perl -0pi -e 's/<title.*title>//ms' *.html
# This is as yet untested - should create backup file
perl -0p -i~ -e 's/<title.*title>//ms' *.html
