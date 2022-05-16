@echo off
:BEGIN
CLS

SET db=sorozatok
:: titles, episodes, users, identitycounters

SET import="c:\Program Files\MongoDB\Server\5.0\bin\mongoimport.exe"
SET export="c:\Program Files\MongoDB\Server\5.0\bin\mongoexport.exe"
SET local="mongodb://localhost:27017/%db%"

ECHO 1.Import
ECHO 2.Export
CHOICE /N /C:12 /M "Enter your choice:"%1
IF ERRORLEVEL ==2 GOTO EXPORT
IF ERRORLEVEL ==1 GOTO IMPORT

:IMPORT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END
ECHO ---------- Importing to the local database ----------
%import% --uri=%local% --collection=titles --drop --file=db_titles.json --jsonArray
%import% --uri=%local%  --collection=episodes --drop --file=db_episodes.json --jsonArray
%import% --uri=%local%  --collection=users --drop --file=db_users.json --jsonArray
%import% --uri=%local%  --collection=identitycounters --drop --file=db_counters.json --jsonArray
GOTO END

:EXPORT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END
ECHO ---------- Exporting from the local database ----------
%export% --uri=%local% --collection=titles --out=db_titles.json --jsonArray --pretty
%export% --uri=%local% --collection=episodes --out=db_episodes.json --jsonArray --pretty
%export% --uri=%local% --collection=users --out=db_users.json --jsonArray --pretty
%export% --uri=%local% --collection=identitycounters --out=db_counters.json --jsonArray --pretty
GOTO END

:END
pause