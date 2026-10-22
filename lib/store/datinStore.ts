"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  MemberPass,
  MembershipApplication,
  ClubEvent,
  EventRegistration,
  Task,
  Announcement,
  AuditLog,
  ClubSettings,
  UserRole,
  TaskStatus,
} from "../types";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

const INITIAL_MEMBERS: UserProfile[] = [
  {
    id: "mem-01",
    name: "Pratham R Raikar",
    email: "prathamraikar@gmail.com",
    phone: "8618095195",
    department: "Computer Science & Engineering",
    academicYear: "3rd Year",
    domain: "Machine Learning & AI",
    role: "super_admin",
    status: "active",
    membershipId: "DATIN-2026-001",
    joinedAt: "2024-09-10",
    skills: ["Python", "TensorFlow", "FastAPI", "PostgreSQL"],
  },
  {
    id: "mem-02",
    name: "Shraddha R Byadgi",
    email: "shraddhabyadgi@gmail.com",
    phone: "8792763135",
    department: "Information Science & Engineering",
    academicYear: "3rd Year",
    domain: "Data Analytics & BI",
    role: "core_committee",
    status: "active",
    membershipId: "DATIN-2026-002",
    joinedAt: "2024-09-12",
    skills: ["SQL", "Tableau", "PowerBI", "Pandas"],
  },
  {
    id: "mem-03",
    name: "Lekhan V T",
    email: "lekhanvt@gmail.com",
    phone: "7676309842",
    department: "Artificial Intelligence & Data Science",
    academicYear: "2nd Year",
    domain: "Full Stack Innovation",
    role: "domain_lead",
    status: "active",
    membershipId: "DATIN-2026-003",
    joinedAt: "2025-02-01",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "mem-04",
    name: "Savya V Vernekar",
    email: "savyav@gmail.com",
    phone: "7204445363",
    department: "Computer Science & Engineering",
    academicYear: "2nd Year",
    domain: "Research & Quantitative Analysis",
    role: "member",
    status: "active",
    membershipId: "DATIN-2026-004",
    joinedAt: "2025-02-15",
    skills: ["Python", "R", "Statistical Modeling"],
  },
  {
    id: "mem-05",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "9845123456",
    department: "Electronics & Communication",
    academicYear: "1st Year",
    domain: "Edge AI & IoT",
    role: "member",
    status: "active",
    membershipId: "DATIN-2026-005",
    joinedAt: "2025-09-01",
    skills: ["C++", "Microcontrollers", "Python"],
  },
];

const INITIAL_APPLICATIONS: MembershipApplication[] = [
  {
    id: "app-101",
    name: "Ananya Deshpande",
    email: "ananya.d@student.biet.edu",
    phone: "9123456780",
    department: "Computer Science",
    academicYear: "2nd Year",
    domain: "Machine Learning & AI",
    skills: "Python, PyTorch, Linear Algebra",
    statement: "Interested in contributing to computer vision projects and building club hackathon solutions.",
    status: "pending",
    submittedAt: "2026-10-22 18:30",
  },
  {
    id: "app-102",
    name: "Kiran Kumar M",
    email: "kiran.km@student.biet.edu",
    phone: "9876501234",
    department: "Information Science",
    academicYear: "1st Year",
    domain: "Data Analytics & BI",
    skills: "Python, SQL basics, Excel",
    statement: "Want to learn exploratory data analysis and participate in club workshops.",
    status: "pending",
    submittedAt: "2026-10-22 19:15",
  },
  {
    id: "app-103",
    name: "Rohan Patil",
    email: "rohan.patil@student.biet.edu",
    phone: "9448123789",
    department: "AI & Data Science",
    academicYear: "3rd Year",
    domain: "Full Stack Innovation",
    skills: "JavaScript, React, Node.js",
    statement: "Looking to collaborate on production club tools and deploy open-source apps.",
    status: "approved",
    submittedAt: "2026-10-21 14:00",
  },
];

const INITIAL_EVENTS: ClubEvent[] = [
  {
    id: "evt-01",
    title: "DATIN INNOVATION HACKATHON 2026",
    slug: "datin-innovation-hackathon-2026",
    description: "24-hour flagship technical hackathon tackling data science, quantitative analytics, and AI agent automation.",
    category: "Hackathon",
    date: "November 14-15, 2026",
    time: "09:00 AM IST",
    venue: "Main Auditorium & Computing Complex, BIET Campus",
    capacity: 120,
    registeredCount: 84,
    isRegistrationOpen: true,
    isPublished: true,
  },
  {
    id: "evt-02",
    title: "MODERN DATA PIPELINES WITH PYTHON & DUCKDB",
    slug: "modern-data-pipelines",
    description: "Hands-on technical workshop building local analytical stores and streaming event architectures.",
    category: "Workshop",
    date: "October 29, 2026",
    time: "02:30 PM IST",
    venue: "CS Seminar Hall (Room 302)",
    capacity: 60,
    registeredCount: 45,
    isRegistrationOpen: true,
    isPublished: true,
  },
];

const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: "reg-01",
    eventId: "evt-01",
    memberId: "mem-01",
    memberName: "Pratham R Raikar",
    memberEmail: "prathamraikar@gmail.com",
    attendanceStatus: "present",
    registeredAt: "2026-10-18 10:00",
    checkedInAt: "2026-10-22 09:12",
  },
  {
    id: "reg-02",
    eventId: "evt-01",
    memberId: "mem-02",
    memberName: "Shraddha R Byadgi",
    memberEmail: "shraddhabyadgi@gmail.com",
    attendanceStatus: "absent",
    registeredAt: "2026-10-18 10:15",
  },
  {
    id: "reg-03",
    eventId: "evt-01",
    memberId: "mem-03",
    memberName: "Lekhan V T",
    memberEmail: "lekhanvt@gmail.com",
    attendanceStatus: "present",
    registeredAt: "2026-10-18 10:45",
    checkedInAt: "2026-10-22 09:25",
  },
  {
    id: "reg-04",
    eventId: "evt-01",
    memberId: "mem-04",
    memberName: "Savya V Vernekar",
    memberEmail: "savyav@gmail.com",
    attendanceStatus: "absent",
    registeredAt: "2026-10-18 11:20",
  },
  {
    id: "reg-05",
    eventId: "evt-01",
    memberId: "mem-05",
    memberName: "Aarav Sharma",
    memberEmail: "aarav.sharma@example.com",
    attendanceStatus: "absent",
    registeredAt: "2026-10-19 14:10",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "tsk-01",
    title: "Deploy Digital Pass QR Verification Service",
    description: "Implement high-contrast verification endpoints with non-guessable HMAC tokens.",
    domain: "Full Stack Innovation",
    assignedToName: "Lekhan V T",
    assignedToEmail: "lekhanvt@gmail.com",
    priority: "urgent",
    status: "in_progress",
    dueDate: "2026-10-25",
    updatedAt: "2026-10-22 17:00",
  },
  {
    id: "tsk-02",
    title: "Prepare Datasets for Data Science Boot Camp",
    description: "Curate cleaned Kaggle datasets and EDA starter notebooks for 1st & 2nd year students.",
    domain: "Data Analytics & BI",
    assignedToName: "Shraddha R Byadgi",
    assignedToEmail: "shraddhabyadgi@gmail.com",
    priority: "high",
    status: "to_do",
    dueDate: "2026-10-27",
    updatedAt: "2026-10-21 11:00",
  },
  {
    id: "tsk-03",
    title: "Draft Hackathon Problem Statements",
    description: "Collaborate with industry mentors on Healthcare & FinTech challenge statements.",
    domain: "Machine Learning & AI",
    assignedToName: "Pratham R Raikar",
    assignedToEmail: "prathamraikar@gmail.com",
    priority: "high",
    status: "in_review",
    dueDate: "2026-10-24",
    updatedAt: "2026-10-22 15:45",
  },
  {
    id: "tsk-04",
    title: "Publish Term Announcement & Schedule",
    description: "Broadcast monthly club roadmap and venue coordination instructions to all members.",
    domain: "Administration",
    assignedToName: "Pratham R Raikar",
    assignedToEmail: "prathamraikar@gmail.com",
    priority: "medium",
    status: "completed",
    dueDate: "2026-10-20",
    updatedAt: "2026-10-20 18:00",
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-01",
    title: "WELCOME TO DATIN COMMAND CENTER",
    content: "Official club management platform launched. Access your digital member pass, register for upcoming hackathons, and review active domain projects.",
    priority: "important",
    authorName: "Club President",
    authorRole: "Super Administrator",
    publishedAt: "Just now",
    isPinned: true,
  },
  {
    id: "ann-02",
    title: "CALL FOR WORKSHOP MENTORS — MODERN DATA PIPELINES",
    content: "Domain leads seeking 2 student facilitators for the upcoming DuckDB & Python pipeline session on Oct 29.",
    priority: "normal",
    authorName: "Shraddha R Byadgi",
    authorRole: "Core Committee",
    publishedAt: "2 hours ago",
    isPinned: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-01",
    actorName: "Pratham R Raikar",
    actorRole: "Super Administrator",
    action: "SYSTEM_INITIALIZED",
    entityType: "settings",
    entityId: "SYS-INIT",
    details: "DATIN Command Center operational store initialized with strict role authorization.",
    timestamp: "2026-10-22 21:00:00",
  },
  {
    id: "aud-02",
    actorName: "Shraddha R Byadgi",
    actorRole: "Core Committee",
    action: "APPLICATION_APPROVED",
    entityType: "application",
    entityId: "app-103",
    details: "Approved membership application for Rohan Patil (AI & Data Science).",
    timestamp: "2026-10-22 21:10:15",
  },
];

const INITIAL_SETTINGS: ClubSettings = {
  clubName: "DATIN | Data2Innovate",
  shortDescription: "Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions.",
  academicYear: "2026 - 2027",
  contactEmail: "datin.club@biet.edu",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  githubUrl: "https://github.com",
  applicationsOpen: true,
};

export function useDatinStore() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("member");
  const [activeMemberId, setActiveMemberId] = useState<string>("mem-01");
  const [members, setMembers] = useState<UserProfile[]>(INITIAL_MEMBERS);
  const [applications, setApplications] = useState<MembershipApplication[]>(INITIAL_APPLICATIONS);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(INITIAL_REGISTRATIONS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<ClubSettings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(isSupabaseConfigured);

  // Synchronous cache read for 0ms initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("datin_store_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.applications) setApplications(parsed.applications);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.registrations) setRegistrations(parsed.registrations);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.currentUserRole) setCurrentUserRole(parsed.currentUserRole);
        if (parsed.activeMemberId) setActiveMemberId(parsed.activeMemberId);
      }
    } catch (e) {
      console.warn("Local cache read failed", e);
    }
    setIsLoaded(true);

    // Asynchronous background hydration from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      setIsCloudConnected(true);
      (async () => {
        try {
          const { data: dbMembers } = await supabase.from("profiles").select("*");
          if (dbMembers && dbMembers.length > 0) {
            setMembers(
              dbMembers.map((m: any) => ({
                id: m.id,
                name: m.name,
                email: m.email,
                phone: m.phone,
                department: m.department,
                academicYear: m.academic_year,
                domain: m.domain,
                role: m.role,
                status: m.status,
                membershipId: m.membership_id,
                joinedAt: m.joined_at?.split("T")[0] || "2026-10-22",
                skills: m.skills || [],
              }))
            );
          }

          const { data: dbApps } = await supabase.from("membership_applications").select("*");
          if (dbApps && dbApps.length > 0) {
            setApplications(
              dbApps.map((a: any) => ({
                id: a.id,
                name: a.name,
                email: a.email,
                phone: a.phone,
                department: a.department,
                academicYear: a.academic_year,
                domain: a.domain,
                skills: a.skills,
                statement: a.statement,
                status: a.status,
                submittedAt: a.submitted_at?.replace("T", " ").substring(0, 16) || "Recently",
                notes: a.notes,
              }))
            );
          }
        } catch (err) {
          console.warn("Supabase background fetch notice:", err);
        }
      })();
    }
  }, []);

  const saveToStorage = useCallback(
    (state: Record<string, unknown>) => {
      try {
        localStorage.setItem("datin_store_v1", JSON.stringify(state));
      } catch (e) {
        console.warn("Storage sync failed", e);
      }
    },
    []
  );

  const logAction = useCallback(
    (action: string, entityType: AuditLog["entityType"], entityId: string, details: string) => {
      const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
      const newLog: AuditLog = {
        id: "aud-" + Date.now().toString(),
        actorName: activeMember.name,
        actorRole: currentUserRole === "super_admin" ? "Super Administrator" : currentUserRole,
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      };
      const updated = [newLog, ...auditLogs];
      setAuditLogs(updated);
      saveToStorage({ members, applications, events, registrations, tasks, announcements, auditLogs: updated, settings, currentUserRole, activeMemberId });

      // Non-blocking background write to Supabase
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("audit_logs")
          .insert({
            id: newLog.id,
            actor_name: newLog.actorName,
            actor_role: newLog.actorRole,
            action: newLog.action,
            entity_type: newLog.entityType,
            entity_id: newLog.entityId,
            details: newLog.details,
            timestamp: newLog.timestamp,
          })
          .then(({ error }: any) => {
            if (error) console.warn("Supabase audit log sync:", error.message);
          });
      }
    },
    [activeMemberId, auditLogs, currentUserRole, members, applications, events, registrations, tasks, announcements, settings, saveToStorage]
  );

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    if (role === "super_admin") setActiveMemberId("mem-01");
    if (role === "core_committee") setActiveMemberId("mem-02");
    if (role === "domain_lead") setActiveMemberId("mem-03");
    if (role === "member") setActiveMemberId("mem-04");
  };

  const approveApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const newMemberId = "mem-" + (members.length + 1).toString().padStart(2, "0");
    const newMembershipId = `DATIN-2026-${(members.length + 1).toString().padStart(3, "0")}`;

    const newMember: UserProfile = {
      id: newMemberId,
      name: target.name,
      email: target.email,
      phone: target.phone,
      department: target.department,
      academicYear: target.academicYear,
      domain: target.domain,
      role: "member",
      status: "active",
      membershipId: newMembershipId,
      joinedAt: new Date().toISOString().split("T")[0],
      skills: target.skills ? target.skills.split(",").map((s) => s.trim()) : ["Student Member"],
    };

    const updatedApps = applications.map((a) => (a.id === appId ? { ...a, status: "approved" as const } : a));
    const updatedMembers = [...members, newMember];

    setApplications(updatedApps);
    setMembers(updatedMembers);
    logAction("APPLICATION_APPROVED", "application", appId, `Approved application for ${target.name} (${target.department}). Assigned ID ${newMembershipId}`);

    // Asynchronous Supabase write
    if (isSupabaseConfigured && supabase) {
      supabase.from("membership_applications").update({ status: "approved" }).eq("id", appId);
      supabase.from("profiles").insert({
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        department: newMember.department,
        academic_year: newMember.academicYear,
        domain: newMember.domain,
        role: newMember.role,
        status: newMember.status,
        membership_id: newMember.membershipId,
        skills: newMember.skills,
      });
    }
  };

  const rejectApplication = (appId: string, notes?: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const updatedApps = applications.map((a) => (a.id === appId ? { ...a, status: "rejected" as const, notes } : a));
    setApplications(updatedApps);
    logAction("APPLICATION_REJECTED", "application", appId, `Rejected application for ${target.name}. Reason: ${notes || "General quota reached"}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("membership_applications").update({ status: "rejected", notes }).eq("id", appId);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16) } : t
    );
    setTasks(updatedTasks);
    logAction("TASK_STATUS_UPDATED", "task", taskId, `Task "${task.title}" moved to ${newStatus}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    }
  };

  const toggleAttendance = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    const nextStatus = reg.attendanceStatus === "present" ? "absent" : "present";
    const checkedInAt = nextStatus === "present" ? new Date().toISOString().replace("T", " ").substring(0, 16) : undefined;

    const updatedRegs = registrations.map((r) =>
      r.id === regId ? { ...r, attendanceStatus: nextStatus as "present" | "absent", checkedInAt } : r
    );
    setRegistrations(updatedRegs);
    logAction("ATTENDANCE_CORRECTION", "attendance", regId, `Updated attendance for ${reg.memberName} to ${nextStatus.toUpperCase()}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("event_registrations").update({ attendance_status: nextStatus, checked_in_at: checkedInAt }).eq("id", regId);
    }
  };

  const publishAnnouncement = (title: string, content: string, priority: Announcement["priority"]) => {
    const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
    const newAnn: Announcement = {
      id: "ann-" + Date.now().toString(),
      title: title.toUpperCase(),
      content,
      priority,
      authorName: activeMember.name,
      authorRole: currentUserRole === "super_admin" ? "Super Administrator" : "Core Committee",
      publishedAt: "Just now",
      isPinned: priority === "urgent" || priority === "important",
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    logAction("ANNOUNCEMENT_PUBLISHED", "settings", newAnn.id, `Published announcement "${title}" with priority ${priority}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("announcements").insert({
        id: newAnn.id,
        title: newAnn.title,
        content: newAnn.content,
        priority: newAnn.priority,
        author_name: newAnn.authorName,
        author_role: newAnn.authorRole,
        published_at: newAnn.publishedAt,
        is_pinned: newAnn.isPinned,
      });
    }
  };

  const submitApplication = (appData: Omit<MembershipApplication, "id" | "status" | "submittedAt">) => {
    const newApp: MembershipApplication = {
      ...appData,
      id: "app-" + Date.now().toString(),
      status: "pending",
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    logAction("APPLICATION_SUBMITTED", "application", newApp.id, `Public application submitted by ${newApp.name} (${newApp.email})`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("membership_applications").insert({
        id: newApp.id,
        name: newApp.name,
        email: newApp.email,
        phone: newApp.phone,
        department: newApp.department,
        academic_year: newApp.academicYear,
        domain: newApp.domain,
        skills: newApp.skills,
        statement: newApp.statement,
        status: newApp.status,
      });
    }

    return newApp;
  };

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  return {
    isLoaded,
    isCloudConnected,
    currentUserRole,
    activeMemberId,
    activeMember,
    members,
    applications,
    events,
    registrations,
    tasks,
    announcements,
    auditLogs,
    settings,
    switchRole,
    setActiveMemberId,
    approveApplication,
    rejectApplication,
    updateTaskStatus,
    toggleAttendance,
    publishAnnouncement,
    submitApplication,
    setSettings,
  };
}
