# Firestore composite indexes

If queries fail with "index required", create these in Firebase Console → Firestore → Indexes:

1. **Collection:** `users`  
   **Fields:** `group_id` (Ascending), `is_matched` (Ascending)

2. **Collection:** `questionnaire_responses`  
   **Fields:** `group_id` (Ascending), `is_locked` (Ascending)

3. **Collection:** `matches`  
   **Fields:** `group_id` (Ascending), `created_at` (Descending)

Or run the app and click the index-creation link in the Firebase error message to auto-create the required index.
