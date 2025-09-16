@echo off
echo Configuration du fichier hosts pour Clynt...
echo.
echo ATTENTION: Ce script doit etre execute en tant qu'administrateur
echo.
pause

REM Sauvegarder le fichier hosts original
copy C:\Windows\System32\drivers\etc\hosts C:\Windows\System32\drivers\etc\hosts.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%

REM Supprimer les anciennes entrees Clynt si elles existent
findstr /v "192.168.1.21 localhost" C:\Windows\System32\drivers\etc\hosts > C:\Windows\System32\drivers\etc\hosts.temp
move C:\Windows\System32\drivers\etc\hosts.temp C:\Windows\System32\drivers\etc\hosts

REM Ajouter la nouvelle entree
echo 192.168.1.21 localhost >> C:\Windows\System32\drivers\etc\hosts

REM Vider le cache DNS
ipconfig /flushdns

echo.
echo Configuration terminee !
echo Votre collegue peut maintenant acceder a l'application via: http://localhost:3000
echo.
pause
