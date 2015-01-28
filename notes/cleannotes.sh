#!/bin/bash
find ../notes/ -name "*.html" | while read file;
do
xmlpatterns ../ui/xq/lib/editor_load.xq.inlined "${file}" -output "${file}".load
xmlpatterns ../ui/xq/lib/editor_save.xq.inlined "${file}".load -output "${file}".save
rm "${file}".load
mv "${file}".save "${file}"
done 
