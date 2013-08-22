#!/bin/sh
mkdir -p ~/Desktop/tmp_pdfs
ps aux | grep -v '*' | grep -o -E '/home/cefn.*\.pdf' | xargs -n1 -I"{}" cp {} ~/Desktop/tmp_pdfs/
