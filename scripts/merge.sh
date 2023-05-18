files=(*)
head -n 1 $files > combined.csv && tail -n+2 -q *.csv >> combined.csv
