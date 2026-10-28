#!/bin/zsh
# fetch.sh name url [name url ...] — скачать сырой кадр, вырезать доску, грейдинг
cd "${0:A:h}"
while (( $# >= 2 )); do
  n=$1; u=$2; shift 2
  curl -s -o raw/$n.png "$u" && python3 ../woodboard.py raw/$n.png done/$n.jpg >/dev/null && python3 ../grade.py done/$n.jpg done/$n.jpg && echo "$n ok"
done
