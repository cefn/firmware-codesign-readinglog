#!/bin/sh
realpath notes/*.html | xargs -n1 -I '{}' bluegriffon "{}"
