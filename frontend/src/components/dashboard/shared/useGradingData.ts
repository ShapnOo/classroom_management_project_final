"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Student } from "@/lib/types";

type GradeTarget = { assignmentId?: string; testId?: string };

export type GradeDraft = Record<string, { marks: string; remarks: string }>;

/**
 * Shared data layer for assignment & test evaluation screens.
 * Loads the classroom, its batch students and existing grades from the API,
 * keeps an editable draft, and persists it via the grade upsert endpoint.
 */
export function useGradingData(classroomId: string, target: GradeTarget, totalMarks: number) {
  const {
    gradeRecords, students, assignments, tests, getClassroomView, upsertGradeRecord,
    fetchClassrooms, fetchCourses, fetchBatches, fetchTeachers, fetchSessions, fetchPrograms,
    fetchStudents, fetchAssignments, fetchTests, fetchGradeRecords,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchTeachers();
    fetchSessions();
    fetchPrograms();
    fetchStudents();
    fetchAssignments();
    fetchTests();
    fetchGradeRecords();
  }, []);

  const resolvedClassroomId = useMemo(() => {
    if (classroomId) return classroomId;
    if (target.assignmentId) {
      const a = assignments.find(item => item.id === target.assignmentId);
      if (a) return a.classroomId;
    }
    if (target.testId) {
      const t = tests.find(item => item.id === target.testId);
      if (t) return t.classroomId;
    }
    return "";
  }, [classroomId, target.assignmentId, target.testId, assignments, tests]);

  const view = getClassroomView(resolvedClassroomId);

  const roster: Student[] = useMemo(
    () => (view ? students.filter(s => s.batchId === view.batch.id).sort((a, b) => a.rollNo.localeCompare(b.rollNo)) : []),
    [students, view]
  );

  const existing = useMemo(() => gradeRecords.filter(g =>
    (resolvedClassroomId ? g.classroomId === resolvedClassroomId : true) &&
    (target.assignmentId ? g.assignmentId === target.assignmentId : g.testId === target.testId)
  ), [gradeRecords, resolvedClassroomId, target.assignmentId, target.testId]);

  const [draft, setDraft] = useState<GradeDraft>({});

  // Hydrate the draft once saved grades arrive (without clobbering in-progress edits)
  useEffect(() => {
    setDraft(prev => {
      const next = { ...prev };
      existing.forEach(g => {
        if (!next[g.studentId]) {
          next[g.studentId] = { marks: String(g.obtainedMarks), remarks: g.remarks || "" };
        }
      });
      return next;
    });
  }, [existing]);

  const setMarks = (studentId: string, marks: string) => {
    const n = Number(marks);
    if (marks !== "" && (isNaN(n) || n < 0 || n > totalMarks)) return;
    setDraft(d => ({ ...d, [studentId]: { marks, remarks: d[studentId]?.remarks || "" } }));
  };

  const setRemarks = (studentId: string, remarks: string) =>
    setDraft(d => ({ ...d, [studentId]: { marks: d[studentId]?.marks || "", remarks } }));

  const [saving, setSaving] = useState(false);

  const save = async () => {
    const entries = Object.entries(draft).filter(([, v]) => v.marks !== "");
    const targetClassroomId = resolvedClassroomId || view?.classroom.id || "";
    if (!targetClassroomId) {
      throw new Error("Classroom ID could not be identified for saving grades.");
    }

    setSaving(true);
    try {
      await Promise.all(entries.map(([studentId, v]) =>
        upsertGradeRecord({
          classroomId: targetClassroomId,
          studentId,
          ...target,
          obtainedMarks: Number(v.marks),
          totalMarks,
          remarks: v.remarks,
        })
      ));
      await fetchGradeRecords(true);
      return entries.length;
    } finally {
      setSaving(false);
    }
  };

  const gradedCount = roster.filter(s => draft[s.id]?.marks).length;

  return { view, roster, draft, setMarks, setRemarks, save, saving, gradedCount };
}

export const initials = (name: string) =>
  name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

export const formatDisplayDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
