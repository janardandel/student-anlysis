# Moodle Web Services REST API Configuration Guide

To enable automated synchronization between your Moodle instance and n8n/Supabase, follow this step-by-step setup guide in Moodle.

---

## 1. Enable Web Services in Moodle

1. Log into Moodle as an **Administrator**.
2. Navigate to: **Site administration** $\rightarrow$ **Server** $\rightarrow$ **Web services** $\rightarrow$ **Overview** (or search for *Enable web services* in Site Administration).
3. Ensure **Enable web services** is set to **Yes**.
4. Navigate to **Site administration** $\rightarrow$ **Server** $\rightarrow$ **Web services** $\rightarrow$ **Manage protocols**:
   - Enable **REST protocol** (click the eye icon so it is visible/open).

---

## 2. Create a Dedicated External Service

1. Go to **Site administration** $\rightarrow$ **Server** $\rightarrow$ **Web services** $\rightarrow$ **External services**.
2. Click **Add**.
3. Fill in:
   - **Name**: `Supabase Reporting Service`
   - **Short name**: `supabase_reporting`
   - **Enabled**: Checked $\checkmark$
   - **Authorized users only**: Checked $\checkmark$
4. Click **Add service**.

---

## 3. Add Required API Functions to the Service

Click on **Functions** next to your newly created service and add the following core Moodle API functions:

| Function Name | Purpose |
| :--- | :--- |
| `mod_quiz_get_user_attempts` | Fetches quiz submission details, attempt number, scores, and finish timestamps |
| `mod_quiz_get_quizzes_by_courses` | Fetches all quizzes, grade caps, and course metadata |
| `core_course_get_courses` | Fetches course list and names |
| `core_enrol_get_enrolled_users` | Fetches student details (ID, full name, email, department) |
| `core_user_get_users_by_field` | Look up individual user profiles by Moodle User ID |

---

## 4. Create a Service Account & Generate a Token

1. Go to **Site administration** $\rightarrow$ **Users** $\rightarrow$ **Accounts** $\rightarrow$ **Add a new user**:
   - Username: `n8n_sync_bot`
   - Authentication method: Manual accounts
   - Assign appropriate teacher/manager or custom role with capability `mod/quiz:viewreports` and `moodle/course:view`.
2. Go to **Site administration** $\rightarrow$ **Server** $\rightarrow$ **Web services** $\rightarrow$ **Manage tokens**.
3. Click **Add token**:
   - **User**: Select `n8n_sync_bot`
   - **Service**: Select `Supabase Reporting Service`
   - **IP restriction**: (Optional: add your self-hosted n8n server IP)
   - **Valid until**: Set according to your security policy.
4. Click **Save changes** and copy your generated **Token string**.

---

## 5. Verify the API via cURL / Postman

Test that the endpoint is reachable from your n8n host:

```bash
curl -X POST "https://<your-moodle-domain>/webservice/rest/server.php" \
  -d "wstoken=YOUR_GENERATED_TOKEN" \
  -d "wsfunction=mod_quiz_get_quizzes_by_courses" \
  -d "moodlewsrestformat=json" \
  -d "courseids[0]=101"
```

If successful, you will receive a JSON array containing quiz records.
