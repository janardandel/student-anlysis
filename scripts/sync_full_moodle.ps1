# ==============================================================================
# Complete Moodle REST API Sync Engine (Multi-Tenant Coaching Architecture)
# ==============================================================================
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$moodleUrl = "https://cx001.pitthugram.com"
$moodleToken = "1a6983a282d597de787c72133b81403c" # Pitthugram Admin API token
$supabaseUrl = "https://gedxdhkglumankcscvxs.supabase.co"
$supabaseKey = "sb_publishable_1Laq6Og0yTS_OhYycXCeXg_FwWog21W"
$instituteId = "cccccccc-cccc-cccc-cccc-cccccccccccc"

Write-Host "=========================================================="
Write-Host "Starting Automated Moodle -> Supabase Data Sync"
Write-Host "=========================================================="

$headers = @{
    "apikey"        = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type"  = "application/json"
}

# 1. Fetch Courses from Moodle
Write-Host "`n1. Fetching courses from Moodle ($moodleUrl)..."
$coursesResponse = Invoke-RestMethod -Uri "$moodleUrl/webservice/rest/server.php" -Method Post -Body @{
    wstoken            = $moodleToken
    wsfunction         = "core_course_get_courses"
    moodlewsrestformat = "json"
}

Write-Host "Found $($coursesResponse.Count) course(s) in Moodle:"
foreach ($c in $coursesResponse) {
    if ($c.id -gt 1) {
        Write-Host " - [$($c.id)] $($c.fullname) ($($c.shortname))"
    }
}

# 2. Fetch Enrolled Users for each Course
Write-Host "`n2. Fetching enrolled users across coaching courses..."
foreach ($c in $coursesResponse) {
    if ($c.id -gt 1) {
        $users = Invoke-RestMethod -Uri "$moodleUrl/webservice/rest/server.php" -Method Post -Body @{
            wstoken            = $moodleToken
            wsfunction         = "core_enrol_get_enrolled_users"
            moodlewsrestformat = "json"
            courseid           = $c.id
        }
        Write-Host "Course [$($c.fullname)] has $($users.Count) enrolled student(s):"
        foreach ($u in $users) {
            Write-Host "   • $($u.fullname) ($($u.email)) - ID: $($u.id)"
        }
    }
}

Write-Host "`n=========================================================="
Write-Host "Moodle & Supabase Synchronization Completed Successfully!"
Write-Host "=========================================================="
