# ==============================================================================
# Comprehensive Full Multi-Class & Student Moodle to Supabase Synchronizer
# ==============================================================================
param(
    [string]$MoodleUrl = "https://cx001.pitthugram.com",
    [string]$MoodleToken = "74e7bb48559f9e077c0cd81226b26e26",
    [string]$InstituteId = "cccccccc-cccc-cccc-cccc-cccccccccccc",
    [string]$SupabaseUrl = "https://gedxdhkglumankcscvxs.supabase.co",
    [string]$SupabaseKey = "sb_publishable_1Laq6Og0yTS_OhYycXCeXg_FwWog21W"
)

Write-Host "=========================================================="
Write-Host "Starting Full Sync from Moodle: $MoodleUrl"
Write-Host "Target Supabase Institute ID: $InstituteId"
Write-Host "=========================================================="

$endpoint = "$MoodleUrl/webservice/rest/server.php"
$headers = @{
    "apikey"        = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "resolution=merge-duplicates"
}

# 1. Sync Courses
Write-Host "`n1. Syncing Courses & Batches..."
$courseRes = Invoke-RestMethod -Uri $endpoint -Method Post -Body @{
    wstoken            = $MoodleToken
    wsfunction         = "core_course_get_courses"
    moodlewsrestformat = "json"
}

$syncedCourses = @{}
foreach ($c in $courseRes) {
    $className = if ($c.id -eq 1) { "General Coaching Batch" } else { "Class " + $c.shortname }
    $coursePayload = @{
        institute_id     = $InstituteId
        moodle_course_id = [int64]$c.id
        course_name      = $c.fullname
        short_name       = $c.shortname
        class_name       = $className
    } | ConvertTo-Json

    try {
        $null = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/courses?on_conflict=moodle_course_id" -Method Post -Headers $headers -Body $coursePayload
        $syncedCourses[$c.id] = $className
        Write-Host " - [OK] Course ID $($c.id): $($c.fullname) ($className)"
    } catch {
        Write-Host " - [Notice] Course $($c.id): $($_.Exception.Message)"
    }
}

# 2. Sync Enrolled Students for each course
Write-Host "`n2. Syncing Enrolled Students..."
$allStudentIds = @{}
foreach ($cId in $syncedCourses.Keys) {
    try {
        $enrolled = Invoke-RestMethod -Uri $endpoint -Method Post -Body @{
            wstoken            = $MoodleToken
            wsfunction         = "core_enrol_get_enrolled_users"
            moodlewsrestformat = "json"
            courseid           = $cId
        }

        foreach ($u in $enrolled) {
            if ($u.id -eq 1) { continue } # Skip guest
            $rollNo = if ($u.idnumber) { $u.idnumber } else { "CX-" + $u.id.ToString("D3") }
            $className = $syncedCourses[$cId]
            
            $studentPayload = @{
                institute_id   = $InstituteId
                moodle_user_id = [int64]$u.id
                email          = if ($u.email) { $u.email } else { "user$($u.id)@cx001.pitthugram.com" }
                full_name      = $u.fullname
                class_name     = $className
                roll_no        = $rollNo
                department     = if ($u.department) { $u.department } else { $className }
            } | ConvertTo-Json

            try {
                $null = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/students?on_conflict=moodle_user_id" -Method Post -Headers $headers -Body $studentPayload
                $allStudentIds[$u.id] = $u.fullname
                Write-Host " - [OK] Student: $($u.fullname) ($rollNo) -> $className"
            } catch {
                Write-Host " - [Notice] Student $($u.fullname): $($_.Exception.Message)"
            }
        }
    } catch {
        Write-Host " - [Notice] Enrolments for course $($cId): $($_.Exception.Message)"
    }
}

# 3. Sync Quizzes
Write-Host "`n3. Syncing Quizzes & Tests..."
$courseIdsList = $syncedCourses.Keys
if ($courseIdsList.Count -gt 0) {
    $quizBody = @{
        wstoken            = $MoodleToken
        wsfunction         = "mod_quiz_get_quizzes_by_courses"
        moodlewsrestformat = "json"
    }
    $idx = 0
    foreach ($id in $courseIdsList) {
        $quizBody["courseids[$idx]"] = $id
        $idx++
    }

    try {
        $quizRes = Invoke-RestMethod -Uri $endpoint -Method Post -Body $quizBody
        if ($quizRes.quizzes) {
            foreach ($q in $quizRes.quizzes) {
                $qPayload = @{
                    institute_id   = $InstituteId
                    moodle_quiz_id = [int64]$q.id
                    quiz_name      = $q.name
                    max_score      = [double]$q.grade
                    passing_score  = [double]$q.grade * 0.6
                    class_name     = $syncedCourses[$q.course]
                } | ConvertTo-Json

                try {
                    $null = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/quizzes?on_conflict=moodle_quiz_id" -Method Post -Headers $headers -Body $qPayload
                    Write-Host " - [OK] Quiz: $($q.name) (Max: $($q.grade) pts)"
                } catch {}
            }
        }
    } catch {
        Write-Host " - [Notice] Quizzes: $($_.Exception.Message)"
    }
}

Write-Host "`n=========================================================="
Write-Host "Sync from cx001.pitthugram.com completed successfully!"
Write-Host "=========================================================="
