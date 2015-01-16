#!/bin/bash

find ../pdfx/ -size -90c -name "*.pdfx.xml" | while read file;
do
rm "${file}"
done 

find ../papers/ -size -5M -name "*.pdf" | while read file;
do
outfile="`basename ${file}`x.xml"
if [ ! -e "${outfile}" ]
then
	curl --data-binary @"$file" -H "Content-Type: application/pdf" -L "http://pdfx.cs.man.ac.uk" > "${outfile}";
fi
done 
