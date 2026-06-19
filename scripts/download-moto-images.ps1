# Baixa 24 imagens temáticas de motos custom / oficina para public/images/cards
$dest = Join-Path $PSScriptRoot "..\public\images\cards"
$heroDest = Join-Path $PSScriptRoot "..\public\images\heroes"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
New-Item -ItemType Directory -Force -Path $heroDest | Out-Null

$cards = @(
  @{ n = "01.jpg"; u = "https://images.unsplash.com/photo-1771402629439-8fc1c7547784?w=800&q=85"; d = "mecânico no motor" },
  @{ n = "02.jpg"; u = "https://images.unsplash.com/photo-1771402629376-adb2177cb2e1?w=800&q=85"; d = "moto verde na oficina" },
  @{ n = "03.jpg"; u = "https://images.unsplash.com/photo-1734535677969-5a93be4e46ad?w=800&q=85"; d = "mecânico na garagem" },
  @{ n = "04.jpg"; u = "https://images.unsplash.com/photo-1766170507513-ef249e0ca426?w=800&q=85"; d = "oficina de motos" },
  @{ n = "05.jpg"; u = "https://images.unsplash.com/photo-1762604462368-aa69fdbb482e?w=800&q=85"; d = "quadro/chassi custom" },
  @{ n = "06.jpg"; u = "https://images.unsplash.com/photo-1762604462286-472334549804?w=800&q=85"; d = "moto em reparo" },
  @{ n = "07.jpg"; u = "https://images.unsplash.com/photo-1771402629441-95e637743f93?w=800&q=85"; d = "custom em montagem" },
  @{ n = "08.jpg"; u = "https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=800&q=85"; d = "trabalho na garagem" },
  @{ n = "09.jpg"; u = "https://images.unsplash.com/photo-1636761358772-798789548d25?w=800&q=85"; d = "close-up reparo" },
  @{ n = "10.jpg"; u = "https://images.unsplash.com/photo-1650569663338-f6921d483868?w=800&q=85"; d = "mecânico na moto" },
  @{ n = "11.jpg"; u = "https://images.unsplash.com/photo-1604260324056-45f7c778754a?w=800&q=85"; d = "moto na garagem" },
  @{ n = "12.jpg"; u = "https://images.unsplash.com/photo-1581858544302-c40e2254ff87?w=800&q=85"; d = "cruiser custom" },
  @{ n = "13.jpg"; u = "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=800&q=85"; d = "motores/peças" },
  @{ n = "14.jpg"; u = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85"; d = "ferramentas oficina" },
  @{ n = "15.jpg"; u = "https://images.unsplash.com/photo-1578474005126-89909099fed6?w=800&q=85"; d = "capacete e moto" },
  @{ n = "16.jpg"; u = "https://images.unsplash.com/photo-1708975477993-6a14d6e52a9e?w=800&q=85"; d = "moto estacionada" },
  @{ n = "17.jpg"; u = "https://images.unsplash.com/photo-1722729450600-4c64253d3c70?w=800&q=85"; d = "detalhe tanque custom" },
  @{ n = "18.jpg"; u = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=85"; d = "moto custom" },
  @{ n = "19.jpg"; u = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=85"; d = "moto na estrada" },
  @{ n = "20.jpg"; u = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=85"; d = "motor/mecânica" },
  @{ n = "21.jpg"; u = "https://images.unsplash.com/photo-1708975477606-e19484f6fd45?w=800&q=85"; d = "moto clássica" },
  @{ n = "22.jpg"; u = "https://images.unsplash.com/photo-1771402629441-95e637743f93?w=800&q=85&crop=faces&fit=crop"; d = "custom crop 2" },
  @{ n = "23.jpg"; u = "https://images.unsplash.com/photo-1762604462368-aa69fdbb482e?w=800&q=85&crop=entropy&fit=crop"; d = "chassi crop 2" },
  @{ n = "24.jpg"; u = "https://images.unsplash.com/photo-1581858544302-c40e2254ff87?w=800&q=85&sat=-15&fit=crop"; d = "cruiser tom escuro" }
)

$heroes = @(
  @{ n = "login.jpg"; u = "https://images.unsplash.com/photo-1734535677969-5a93be4e46ad?w=1920&q=85" },
  @{ n = "dashboard.jpg"; u = "https://images.unsplash.com/photo-1771402629441-95e637743f93?w=1920&q=85" },
  @{ n = "service-orders.jpg"; u = "https://images.unsplash.com/photo-1771402629439-8fc1c7547784?w=1920&q=85" },
  @{ n = "clients.jpg"; u = "https://images.unsplash.com/photo-1581858544302-c40e2254ff87?w=1920&q=85" },
  @{ n = "inventory.jpg"; u = "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=85" },
  @{ n = "projects.jpg"; u = "https://images.unsplash.com/photo-1762604462368-aa69fdbb482e?w=1920&q=85" },
  @{ n = "finance.jpg"; u = "https://images.unsplash.com/photo-1766170507513-ef249e0ca426?w=1920&q=85" },
  @{ n = "users.jpg"; u = "https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1920&q=85" },
  @{ n = "sidebar.jpg"; u = "https://images.unsplash.com/photo-1771402629376-adb2177cb2e1?w=800&q=85" }
)

foreach ($item in $cards) {
  Start-Sleep -Milliseconds 400
  $out = Join-Path $dest $item.n
  try {
    Invoke-WebRequest -Uri $item.u -OutFile $out -UseBasicParsing -TimeoutSec 45
    Write-Host "OK card $($item.n) - $($item.d)"
  } catch {
    Write-Host "FAIL card $($item.n) - $($item.d)"
  }
}

foreach ($item in $heroes) {
  Start-Sleep -Milliseconds 400
  $out = Join-Path $heroDest $item.n
  try {
    Invoke-WebRequest -Uri $item.u -OutFile $out -UseBasicParsing -TimeoutSec 45
    Write-Host "OK hero $($item.n)"
  } catch {
    Write-Host "FAIL hero $($item.n)"
  }
}
