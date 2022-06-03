@echo off
:BEGIN
CLS

SET db=sorozatok
SET atlasAuth=enztu
SET mongoPath=C:\fontos\mongodb\bin
:: titles, episodes, users, identitycounters

SET import="%mongoPath%\mongoimport.exe"
SET export="%mongoPath%\mongoexport.exe"
SET atlas="mongodb+srv://m001-student:m001-student@sandbox.%atlasAuth%.mongodb.net/%db%"

ECHO 1. -- Import --
ECHO 2. -- Export --
CHOICE /N /C:12 /M "Enter your choice:"%1
IF ERRORLEVEL ==2 GOTO EXPORT
IF ERRORLEVEL ==1 GOTO IMPORT

:IMPORT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END
ECHO ---------- Importing to the atlas database ----------
%import% --uri=%atlas% --collection=titles --drop --file=db_titles.json --jsonArray
%import% --uri=%atlas%  --collection=episodes --drop --file=db_episodes.json --jsonArray
%import% --uri=%atlas%  --collection=users --drop --file=db_users.json --jsonArray
%import% --uri=%atlas%  --collection=identitycounters --drop --file=db_counters.json --jsonArray
GOTO END

:EXPORT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END
ECHO ---------- Exporting from the atlas database ----------
%export% --uri=%atlas% --collection=titles --out=db_titles.json --jsonArray --pretty
%export% --uri=%atlas% --collection=episodes --out=db_episodes.json --jsonArray --pretty
%export% --uri=%atlas% --collection=users --out=db_users.json --jsonArray --pretty
%export% --uri=%atlas% --collection=identitycounters --out=db_counters.json --jsonArray --pretty
GOTO END

:END
pause