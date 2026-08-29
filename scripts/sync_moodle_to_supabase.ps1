# ==============================================================================
# Pitthugram Moodle to Supabase Automated Sync Script
# ==============================================================================
param(
    [string]$MoodleUrl = "https://cx001.pitthugram.com",
    [string]$MoodleToken = "74e7bb48559f9e077c0cd81226b26e26",
    [string]$InstituteId = "cccccccc-cccc-cccc-cccc-cccccccccccc",
    [string]$SupabaseUrl = "https://gedxdhkglumankcscvxs.supabase.co",
    [string]$SupabaseKey = "sb_publishable_1Laq6Og0yTS_OhYycXCeXg_FwWog21W"
)

Write-Host "=== Starting Moodle to Supabase Sync ==="
Write-Host "Moodle: $MoodleUrl"
Write-Host "Institute ID: $InstituteId"

$wsEndpoint = "$MoodleUrl/webservice/rest/server.php"
$headers = @{
    "apikey"        = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "resolution=merge-duplicates"
}

# 1. Fetch Courses from Moodle
$bodyCourses = @{
    wstoken            = $MoodleToken
    wsfunction         = "core_course_get_courses"
    moodlewsrestformat = "json"
}

try {
    $courses = Invoke-RestMethod -Uri $wsEndpoint -Method Post -Body $bodyCourses
    Write-Host "Retrieved $($courses.Count) courses from Moodle."
} catch {
    Write-Host "Failed to fetch courses: $($_.Exception.Message)"
    exit 1
}

# 2. Upsert Courses into Supabase
foreach ($course in $courses) {
    $coursePayload = @{
        institute_id     = $InstituteId
        moodle_course_id = [int64]$course.id
        course_name      = $course.fullname
        short_name       = $course.shortname
        class_name       = "Batch $($course.shortname)"
    } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/courses?on_conflict=moodle_course_id" -Method Post -Headers $headers -Body $coursePayload
        Write-Host " [OK] Synced Course: $($course.fullname)"
    } catch {
        Write-Host " [Notice] Course sync: $($_.Exception.Message)"
    }
}

# 3. Fetch Quizzes
$courseIds = $courses | ForEach-Object { $_.id }
if ($courseIds.Count -gt 0) {
    $quizBody = @{
        wstoken            = $MoodleToken
        wsfunction         = "mod_quiz_get_quizzes_by_courses"
        moodlewsrestformat = "json"
    }
    for ($i = 0; $i -lt $courseIds.Count; $i++) {
        $quizBody["courseids[$i]"] = $courseIds[$i]
    }
    
    try {
        $quizRes = Invoke-RestMethod -Uri $wsEndpoint -Method Post -Body $quizBody
        if ($quizRes.quizzes) {
            Write-Host "Retrieved $($quizRes.quizzes.Count) quizzes from Moodle."
            foreach ($q in $quizRes.quizzes) {
                $qPayload = @{
                    institute_id   = $InstituteId
                    moodle_quiz_id = [int64]$q.id
                    quiz_name      = $q.name
                    max_score      = [double]$q.grade
                    passing_score  = [double]$q.grade * 0.5
                    class_name     = "Batch $($q.course)"
                } | ConvertTo-Json
                
                try {
                    $null = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/quizzes?on_conflict=moodle_quiz_id" -Method Post -Headers $headers -Body $qPayload
                    Write-Host " [OK] Synced Quiz: $($q.name)"
                } catch {}
            }
        }
    } catch {
        Write-Host "Notice fetching quizzes: $($_.Exception.Message)"
    }
}

Write-Host "=== Sync Completed Successfully ==="
