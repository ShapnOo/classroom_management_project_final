-- Academic Lab: SQL Window Functions & Analytics
-- Department of Computer Science & Engineering

-- 1. Partition By & Dense Rank
SELECT 
    student_id,
    course_id,
    total_score,
    DENSE_RANK() OVER(PARTITION BY course_id ORDER BY total_score DESC) as merit_rank,
    AVG(total_score) OVER(PARTITION BY course_id) as course_average
FROM student_transcripts;

-- 2. Running Total of Course Credits
SELECT 
    id,
    semester,
    credits,
    SUM(credits) OVER(ORDER BY semester ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_credits
FROM courses;
