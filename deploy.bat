@echo off
for /f %%i in ('powershell -command "[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()"') do set TS=%%i
for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd.HHmm"') do set VER=%%i
powershell -command "Set-Content -Path 'version.json' -Value ('{\"v\":\"' + $env:VER + '\",\"t\":' + $env:TS + '}') -Encoding utf8NoBOM" 2>nul
powershell -command "[System.IO.File]::WriteAllText('version.json', ('{\"v\":\"' + $env:VER + '\",\"t\":' + $env:TS + '}'))"
echo Version: %VER%
call npx netlify deploy --prod --dir . --auth nfc_gQJXE2Nm9gp4kjkNtFT1tqpNsHFhP2g44852 --site 771f34b5-b2cb-4ad1-af8b-6432495b67a2 --skip-functions-cache
pause
