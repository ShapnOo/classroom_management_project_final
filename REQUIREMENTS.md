# 🎓 Classroom Management System

## Platform Overview
One platform with three role-based portals:
> **Admin Portal → manages the academic ecosystem**
> **Teacher Portal → manages classrooms and teaching**
> **Student Portal → consumes learning content and tracks performance**

The key differentiator throughout the UI should be **Course Progress & Continuity** — not just storing files.

---

# 1. 🌐 Common UI

All three roles share a common design language.

### Global Layout

**Left Sidebar**
* Dashboard
* My Classrooms / Classrooms
* Courses
* Calendar
* Notifications
* Reports
* Profile
* Settings

**Top Bar**
* Global Search
* Notifications 🔔
* Messages
* User Profile
* Quick Action button

### Common Components
* Breadcrumbs
* Search & filters
* Data tables
* Pagination
* Modal dialogs
* File uploader
* Date picker
* Rich text editor
* Status badges
* Progress bars
* Charts
* Toast notifications
* Confirmation dialogs

---

# 2. 🔐 Authentication

### Login
**Email / Student ID / Employee ID**
**Password**
☐ Remember me
**Forgot Password?**
`Login`

### Optional
* Password reset
* Email verification
* Session management
* Role-based redirection

After login:
```text
Admin    → Admin Dashboard
Teacher  → Teacher Dashboard
Student  → Student Dashboard
```

---

# 👨💼 3. ADMIN PORTAL

The Admin controls the entire academic environment.

## Admin Dashboard

### Top Statistics
```text
Teachers       Students       Classrooms       Courses
   48             1,240            72             35
```

### Additional Statistics
```text
Active Classes
Today's Classes
Pending Assignments
Upcoming Tests
Average Attendance
```

### Charts
**Student Enrollment**
**Classroom Distribution**
**Attendance Overview**
**Course Progress**
**Assignment Submission**

---

# 4. Admin → User Management

## Teachers

### Teacher List
| ID   | Name       | Department | Courses | Status | Action |
| ---- | ---------- | ---------- | ------- | ------ | ------ |
| T001 | Dr. Rahman | CSE        | 3       | Active | View   |

Actions:
* View
* Edit
* Activate/Deactivate
* Reset Password

### Add Teacher
Fields:
* Teacher ID
* Name
* Email
* Phone
* Department
* Designation
* Profile Picture
* Status

## Students

### Student List
* Student ID
* Name
* Batch
* Department
* Email
* Status

Actions:
* View Profile
* Edit
* Assign Batch
* Activate/Deactivate

### Add Student
* Student ID
* Name
* Email
* Phone
* Batch
* Department
* Semester
* Profile Picture

---

# 5. Admin → Batch Management

### Batch List
Example:
**PGDIT Spring 2026**
* Batch Code
* Program
* Start Date
* End Date
* Students
* Classrooms

### Batch Details
```text
PGDIT Spring 2026

Students: 42
Classrooms: 8
Teachers: 12
Courses: 10
```

Tabs:
* Students
* Courses
* Classrooms
* Schedule
* Reports

---

# 6. Admin → Course Management

### Course List
```text
Database Management System
Software Engineering
Web Programming
Computer Networks
System Analysis & Design
```

Course details:
* Course Code
* Course Name
* Credit
* Department
* Semester
* Syllabus
* Assigned Teachers

---

# 7. Admin → Classroom Management
This is one of the **core modules**.

### Classroom List
Cards:
**Database Management System**
> Batch: Spring 2026
> Teacher: Dr. Rahman
> Students: 42
> Progress: 68%

`Open Classroom`

### Create Classroom
Fields:
* Classroom Name
* Course
* Batch
* Section
* Teacher
* Semester
* Academic Year
* Start Date
* End Date
* Classroom Status

---

# 8. Admin → Academic Calendar

Calendar view:
```text
August 2026

Sun Mon Tue Wed Thu Fri Sat
                    1
2   3   4   5   6   7   8
9  10  11  12  13  14  15
```

Events:
🟦 Class
🟩 Assignment Deadline
🟨 Class Test
🟥 Holiday

---

# 9. Admin → Reports

### Academic Reports
* Attendance Report
* Course Progress Report
* Assignment Report
* Class Test Report
* Student Performance
* Teacher Activity
* Classroom Activity

Export:
**PDF | Excel | CSV**

---

# 👨🏫 10. TEACHER PORTAL
This is where your application becomes really interesting.

## Teacher Dashboard

### Welcome
> Good morning, Dr. Rahman

### Today's Classes
**10:00 AM — DBMS**
> Batch: PGDIT Spring 2026
> Students: 42

### 🔥 Continue Previous Class
> Previous Class: #08
> Topic: Normalization
> Completed: 70%
> Remaining: 3NF Examples

**[ Start Class ]**
This should be the most prominent action on the dashboard.

## Dashboard Statistics
```text
My Classrooms      5
Total Students    180
Today's Classes     2
Pending Reviews    12
```

---

# 11. Teacher → My Classrooms

Cards:

### DBMS
**Batch:** Spring 2026
**Students:** 42
**Classes:** 18
**Progress:** 68%

### Software Engineering
**Batch:** Spring 2026
**Students:** 38
**Classes:** 15
**Progress:** 74%

---

# 12. 🏫 Classroom Overview
When teacher opens a classroom:

### Header
**Database Management System**
> Batch: Spring 2026
> Teacher: Dr. Rahman

### Classroom Tabs
```text
Overview
Class Sessions
Materials
Students
Attendance
Assignments
Class Tests
Announcements
Progress
Reports
```

---

# 13. Classroom → Overview

### Course Progress
**68% Complete**

### Next Class
> Continue from: **3NF**

### Upcoming
* Assignment Deadline
* Class Test
* Next Class

### Recent Activity
```text
Today
✓ Class #18 completed

Yesterday
📄 New material uploaded

10 Aug
📝 Assignment published
```

---

# 14. 🔥 Classroom → Class Sessions
This is the heart of the system.

### Session History
| Class | Date   | Topic         | Progress | Status    |
| ----- | ------ | ------------- | -------: | --------- |
| #01   | 10 Jul | Introduction  |     100% | Completed |
| #02   | 13 Jul | ER Model      |     100% | Completed |
| #03   | 17 Jul | Normalization |      70% | Partial   |
| #04   | 20 Jul | Normalization |     100% | Completed |

---

# 15. Start Class
Teacher clicks:
**+ Start New Class**

System automatically loads:
### Previous Class
> **Class #08 — 05 Aug 2026**

**Last Topic:** 2NF
**Completion:** 100%

### Recommended Starting Point
> **3NF**

Then teacher enters:
### Today's Session
* Date
* Start Time
* End Time
* Topic
* Description
* Topics Covered
* Completion %
* Materials Used
* Teacher Notes
* Remaining Topics

### Attendance
Teacher can take attendance directly here.
**[ Save & Complete Class ]**

---

# 16. Course Continuity
After saving:

```text
CLASS #09

Today's Coverage
────────────────────
3NF
Functional Dependency
BCNF Introduction

Completed: 65%

Remaining
────────────────────
BCNF Examples
Practical Problems

NEXT CLASS
────────────────────
Continue → BCNF Examples
```
This becomes the **core academic timeline**.

---

# 17. 📚 Classroom → Materials

### Material Library
Filter:
* All
* Lecture Notes
* Slides
* PDF
* Video
* Practical
* Reference

Example:
```text
📄 Normalization.pdf
   Class #08
   05 Aug 2026

📊 DBMS Lecture 08.pptx
   Class #08

💻 Normalization.sql
   Class #09
```
Teacher can:
* Upload
* Rename
* Replace
* Delete
* Organize by topic/class

---

# 18. 👨🎓 Classroom → Students

Student list:
| Student ID | Name      | Attendance | Assignments | Avg. Marks |
| ---------- | --------- | ---------: | ----------: | ---------: |
| 24201      | Mainul    |        92% |        8/10 |        82% |
| 24202      | Waliullah |        87% |        7/10 |        76% |

Click student → **Student Academic Profile**

---

# 19. ✅ Attendance

Teacher chooses:
**Class #09 — 12 Aug 2026**

Then:
```text
☑ Present
☑ Present
☐ Absent
🕐 Late
```

Bulk actions:
* Mark All Present
* Mark All Absent

Attendance summary:
> **40 / 42 Present — 95.2%**

---

# 20. 📝 Assignments

### Assignment List
```text
ER Diagram Assignment
Due: 15 Aug
Submitted: 36/42
Pending: 6
```

### Create Assignment
Fields:
* Title
* Description
* Instructions
* Attachment
* Maximum Marks
* Publish Date
* Due Date
* Classroom

---

# 21. Assignment Evaluation
Teacher sees:

| Student   | Submission | Status    | Marks |
| --------- | ---------- | --------- | ----: |
| Mainul    | 📄 View    | Submitted |  8/10 |
| Waliullah | 📄 View    | Submitted |  9/10 |
| Rahim     | —          | Pending   |     — |

Teacher can:
* View submission
* Download
* Give marks
* Add feedback
* Return submission

---

# 22. 🧪 Class Tests

### Test List
**Class Test #01**
> Topic: ER Model
> Date: 01 Aug
> Total Marks: 20

**Class Test #02**
> Topic: Normalization
> Date: 15 Aug
> Total Marks: 25

### Test Result Entry
Teacher can enter:
| Student   | Marks |
| --------- | ----: |
| Mainul    |    18 |
| Waliullah |    21 |
| Rahim     |    15 |

System automatically calculates:
* Average
* Highest
* Lowest
* Percentage
* Grade

---

# 23. 📢 Announcements
Teacher:
**+ New Announcement**

Example:
> **Tomorrow's class will start from BCNF. Please review the previous lecture.**

Options:
* Publish now
* Schedule
* Attach file

---

# 24. 📊 Teacher → Progress

### Course Progress Dashboard
```text
Overall Course Progress

██████████████░░░░░░ 68%
```

### Topic Progress
| Topic            | Progress |
| ---------------- | -------: |
| Introduction     |     100% |
| ER Model         |     100% |
| Relational Model |     100% |
| Normalization    |      80% |
| SQL              |      40% |
| Transactions     |       0% |

### Course Completion Forecast
> 18 classes completed
> 8 classes remaining
> 32% syllabus remaining

---

# 25. 📈 Teacher Reports
Reports:
* Student Attendance
* Class Attendance
* Course Progress
* Assignment Submission
* Assignment Marks
* Class Test Results
* Student Performance
* Classroom Activity

Export:
**PDF / Excel**

---

# 👨🎓 26. STUDENT PORTAL
Student experience should be much simpler.

## Student Dashboard

### Welcome
> Good morning, Tahmid

### Today's Classes
**DBMS — 10:00 AM**
> Room: 402
> Teacher: Dr. Rahman

### Statistics
```text
Attendance       89%
Assignments      2 Pending
Average Marks    82%
Courses          5
```

---

# 27. My Classrooms
Cards:

### Database Management System
**68% Complete**
Attendance: **92%**

Next Topic:
> 3NF

`Open Classroom`

---

# 28. Student Classroom
Tabs:
```text
Overview
Class Timeline
Materials
Assignments
Class Tests
Attendance
Progress
Announcements
```

---

# 29. 📅 Class Timeline
This should be one of the **best student screens**.

### Database Management System
```text
12 Aug 2026
━━━━━━━━━━━━━━━━━━━━

CLASS #09

Topic
3NF & Functional Dependency

Covered
✓ 3NF
✓ Functional Dependency

Remaining
→ BCNF Examples

Materials
📄 Lecture Slides
📄 Examples

Attendance
✓ Present
```

Then previous:
```text
08 Aug 2026

CLASS #08

Topic
2NF

Coverage
100%
```
Students can scroll through the entire course history.

---

# 30. 📚 Student Materials
Students can browse:
```text
Course Materials

📁 Class 01
📁 Class 02
📁 Class 03
📁 Class 04

OR

📁 Lecture Notes
📁 Slides
📁 Practical
📁 Reference
```
Each file:
**Preview | Download**

---

# 31. 📝 Student Assignments

### Assignment Dashboard
```text
Pending
────────────────
ER Diagram
Due: 15 Aug
[ Submit ]

Submitted
────────────────
Database Design
✓ Submitted

Graded
────────────────
Normalization
9/10
```

---

# 32. Assignment Submission
Student opens assignment:

### ER Diagram
**Marks:** 10
**Deadline:** 15 August

**Instructions**
> Design an ER diagram for...

### Upload
`Drag & Drop File`
**[ Submit Assignment ]**

After submission:
> ✅ Submitted on 12 Aug 2026, 8:32 PM

---

# 33. 🧪 Student Class Tests

### Test History
| Test    | Date   | Marks |
| ------- | ------ | ----: |
| Test 01 | 01 Aug | 18/20 |
| Test 02 | 15 Aug | 21/25 |

### Performance
**Average: 82%**

---

# 34. ✅ Student Attendance

### Attendance Overview
**Overall: 89%**

| Course     | Classes | Present | Attendance |
| ---------- | ------: | ------: | ---------: |
| DBMS       |      18 |      17 |        94% |
| SE         |      15 |      13 |        87% |
| Networking |      20 |      17 |        85% |

Click course → detailed attendance timeline.

---

# 35. 📊 Student Performance
This is another strong screen.

### Academic Performance
```text
Assignments       85%
Class Tests       82%
Attendance        89%
Overall           84%
```

Charts:
* Test performance
* Assignment performance
* Attendance trend
* Course progress

---

# 36. 📢 Student Announcements
Central notification feed:
> 🔔 DBMS class tomorrow at 10 AM
> 📝 New assignment published
> 📚 New lecture material uploaded
> 🧪 Class Test #02 result published

---

# 37. 🔔 Notification System
Notifications can be generated for:

### Teacher
* Assignment submitted
* Assignment deadline approaching
* Class scheduled
* Student absent
* Test result pending

### Student
* New material
* New assignment
* Assignment deadline
* New announcement
* Test result published
* Class schedule changed

---

# 38. 🗓️ Shared Calendar
All roles get a calendar appropriate to their role.

### Events
🟦 Class
🟨 Assignment
🟥 Test
🟩 Deadline
🟪 Announcement

---

# 39. 🔍 Global Search
This would be a nice quality-of-life feature.

Search:
> `Normalization`

Results:
```text
📚 Course: DBMS

Classes:
Class #08
Class #09

Materials:
Normalization.pdf
3NF Slides.pptx

Assignments:
Normalization Assignment
```

---

# 40. ⚙️ Settings

### Admin
* System Settings
* Academic Year
* Semester
* Notification Settings
* User Roles
* Permissions

### Teacher
* Profile
* Password
* Notification Settings

### Student
* Profile
* Password
* Notification Settings

---

# 🧩 Role & Permission Structure
I'd keep the RBAC straightforward:

| Feature             | Admin | Teacher | Student |
| ------------------- | :---: | :-----: | :-----: |
| Manage Teachers     |   ✅   |    ❌    |    ❌    |
| Manage Students     |   ✅   |    ❌    |    ❌    |
| Manage Batches      |   ✅   |    ❌    |    ❌    |
| Create Classroom    |   ✅   |    ✅    |    ❌    |
| Manage Classroom    |   ✅   |    ✅    |   👁️   |
| Upload Materials    |   ✅   |    ✅    |    ❌    |
| View Materials      |   ✅   |    ✅    |    ✅    |
| Manage Attendance   |   ✅   |    ✅    |   👁️   |
| Create Assignment   |   ✅   |    ✅    |    ❌    |
| Submit Assignment   |   ❌   |   👁️   |    ✅    |
| Evaluate Assignment |   ❌   |    ✅    |   👁️   |
| Create Class Test   |   ❌   |    ✅    |   👁️   |
| Manage Results      |   ❌   |    ✅    |   👁️   |
| View Progress       |   ✅   |    ✅    |    ✅    |
| Announcements       |   ✅   |    ✅    |   👁️   |
| Reports             |   ✅   |    ✅    | Limited |
| User Management     |   ✅   |    ❌    |    ❌    |

---

# ⭐ The 5 Features I'd Highlight in Your Presentation
Don't present it as "we made a classroom management CRUD system."
Your **selling points** should be:

### 1. 🔄 Course Continuity Tracking
> Automatically maintains where each class ended and where the next class should begin.

### 2. 📅 Class-wise Academic Timeline
> Complete chronological record of teaching activities.

### 3. 📚 Centralized Learning Materials
> All course materials organized according to classroom/class/session.

### 4. 📊 Integrated Assessment Management
> Attendance + Assignments + Class Tests + Marks + Performance.

### 5. 👥 Role-Based Academic Ecosystem
> Admin → Teacher → Classroom → Student.

That gives you a **very coherent PGDIT project** instead of a collection of random modules.
If you eventually implement this, I'd also keep **AI as Phase 2/optional**—things like automatic class summaries, material tagging, and "suggest next topic"—so your core project remains completely achievable even without AI.
