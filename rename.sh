#!/bin/bash
set -e

echo "Renommage EchoTag -> SahelMesh"

# Remplacer dans le contenu des fichiers
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.txt" -o -name "*.yml" -o -name "*.yaml" -o -name "*.xml" -o -name "*.config" \) ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./android/*" ! -path "./ios/*" ! -path "./build/*" | while read f; do
    sed -i 's/EchoTag/SahelMesh/g' "$f"
    sed -i 's/ECHOTAG/SAHELMESH/g' "$f"
    sed -i 's/echotag/sahelmesh/g' "$f"
    sed -i 's/Echotag/Sahelmesh/g' "$f"
    echo "Modifié: $f"
done

# Renommer les dossiers (en commençant par les plus profonds pour éviter les erreurs)
find . -depth -type d -iname "*echotag*" ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./android/*" ! -path "./ios/*" ! -path "./build/*" | while read d; do
    dir=$(basename "$d")
    newdir=$(echo "$dir" | sed -E 's/[eE][cC][hH][oO][tT][aA][gG]/sahelmesh/g')
    if [ "$dir" != "$newdir" ]; then
        mv "$d" "$(dirname "$d")/$newdir"
        echo "Dossier renommé: $d -> $(dirname "$d")/$newdir"
    fi
done

# Renommer les fichiers
find . -type f -iname "*echotag*" ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./android/*" ! -path "./ios/*" ! -path "./build/*" | while read f; do
    file=$(basename "$f")
    newfile=$(echo "$file" | sed -E 's/[eE][cC][hH][oO][tT][aA][gG]/sahelmesh/g')
    if [ "$file" != "$newfile" ]; then
        mv "$f" "$(dirname "$f")/$newfile"
        echo "Fichier renommé: $f -> $(dirname "$f")/$newfile"
    fi
done

echo "Terminé !"