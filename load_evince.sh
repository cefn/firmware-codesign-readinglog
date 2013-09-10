#!/bin/sh
find /home/cefn/Desktop/pdfs_to_load/ -type f -name '*.pdf' -print0 | nohup xargs --max-procs=0 -n1 -0 evince
