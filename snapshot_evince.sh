#!/bin/sh
mkdir ~/Desktop/tmp_pdfs
ps aux | grep -o -E ' /[^ ]*pdf$' | xargs -n1 -I"{}" cp {} ~/Desktop/tmp_pdfs/
