
source ~/venv/bin/activate

pip freeze > requirements.txt



git add .

git commit -m "Commit made on $(date)"
git branch -M main
git push -u origin main