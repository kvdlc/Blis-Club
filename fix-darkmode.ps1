# Fix dark mode inconsistencies in key app files
$files = @(
  "src/app/(app)/guau/app/page.tsx",
  "src/app/(app)/guau/app/HeatmapWidget.tsx",
  "src/app/(app)/guau/app/DashboardWidgets.tsx",
  "src/app/(app)/guau/app/tracker/TrackerClient.tsx",
  "src/app/(app)/guau/app/tracker/paseo/page.tsx",
  "src/app/(app)/guau/app/perfil/ProfileClient.tsx",
  "src/app/(app)/guau/app/tracker/agilidad/AgilidadClient.tsx",
  "src/components/AgilityReview.tsx",
  "src/components/AgilityObstaclePicker.tsx",
  "src/app/(app)/guau/app/nutricion/NutritionHub.tsx",
  "src/components/MealCalendarWidget.tsx",
  "src/components/DogSwitcher.tsx",
  "src/app/(marketing)/guau/web/WebLandingClient.tsx"
)

function Add-DarkClass($line, $lightClass, $darkClass) {
  if ($line -match $lightClass -and $line -notmatch $darkClass) {
    return $line -replace [regex]::Escape($lightClass), "$lightClass $darkClass"
  }
  return $line
}

foreach ($rel in $files) {
  $path = Join-Path $PSScriptRoot $rel
  if (-not (Test-Path $path)) { continue }
  $lines = Get-Content $path
  $newLines = @()
  foreach ($line in $lines) {
    $orig = $line
    # Text colors
    $line = Add-DarkClass $line "text-zinc-500" "dark:text-zinc-400"
    $line = Add-DarkClass $line "text-zinc-700" "dark:text-zinc-300"
    $line = Add-DarkClass $line "text-zinc-800" "dark:text-zinc-200"
    $line = Add-DarkClass $line "text-zinc-900" "dark:text-zinc-100"
    # Backgrounds
    $line = Add-DarkClass $line "bg-zinc-50" "dark:bg-zinc-800/50"
    $line = Add-DarkClass $line "bg-zinc-100" "dark:bg-zinc-800"
    $line = Add-DarkClass $line "bg-white" "dark:bg-zinc-900"
    # Borders
    $line = Add-DarkClass $line "border-zinc-200" "dark:border-zinc-700"
    $line = Add-DarkClass $line "border-zinc-100" "dark:border-zinc-800"
    $newLines += $line
  }
  Set-Content -Path $path -Value ($newLines -join "`n") -NoNewline
}
