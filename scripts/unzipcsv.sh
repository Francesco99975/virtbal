unzip csvs.zip
rm csvs.zip
cmp=Description,Withdrawals,Deposits,Date,Balance
for file in *.csv ; do
    raw=$(head -n1 -q "$file")
    h="${raw/$'\r'/}"
    if [ "$h" != "$cmp" ]; then
        rm "$file"
    fi
done

for file in *.csv ; do
    sed -i '$ d' "$file"
done