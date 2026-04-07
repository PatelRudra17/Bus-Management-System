Write-Host "==================================="
Write-Host "Your Computer's IP Addresses:"
Write-Host "==================================="
Write-Host ""

Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike '*Loopback*' -and
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254.*'
} | ForEach-Object {
    Write-Host "Interface: $($_.InterfaceAlias)"
    Write-Host "IP Address: $($_.IPAddress)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==================================="
Write-Host "Mobile App Configuration:"
Write-Host "==================================="
Write-Host "Currently set to: 10.226.167.131" -ForegroundColor Yellow
Write-Host ""
Write-Host "Is 10.226.167.131 in the list above?"
Write-Host "  YES -> Run: fix-network.bat (as Administrator)"
Write-Host "  NO  -> Run: update-mobile-ip.bat and enter the correct IP"
Write-Host ""
