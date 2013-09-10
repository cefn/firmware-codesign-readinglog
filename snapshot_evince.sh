#!/bin/sh
mkdir -p ~/Desktop/pdfs_saved
ps aux | grep -v '*' | grep -o -E '/home/cefn.*\.pdf' | xargs -n1 -I"{}" cp {} ~/Desktop/pdfs_saved/
