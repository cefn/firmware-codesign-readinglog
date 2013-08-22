#!/bin/sh
find /home/cefn/Desktop/tmp_pdfs/ -type f -name '*.pdf' -print0 | xargs -n1 -0 log_paper.sh
