#!/bin/sh
mkdir -p ~/Desktop/pdfs_saved
rm -f ~/Desktop/pdfs_saved/*
ps aux | grep -v '*' | grep -o -P '(?<=evince).*/.*\.pdf' | xargs -n1 -I"{}" cp "{}" ~/Desktop/pdfs_saved/
rsync --archive --whole-file --recursive --delete ~/Desktop/pdfs_saved/ ~/Desktop/pdfs_to_load/
