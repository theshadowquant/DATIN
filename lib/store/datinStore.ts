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

const DEFAULT_ADMIN: UserProfile = {
  id: "admin-01",
  name: "Club Administrator",
  email: "admin@datin.biet.edu",
  phone: "",
  department: "Computer Science & Engineering",
  academicYear: "Core Coordinator",
  domain: "Core Administration",
  role: "super_admin",
  status: "active",
  membershipId: "DATIN-ADMIN-001",
  joinedAt: new Date().toISOString().split("T")[0],
  skills: ["Platform Management", "Club Operations"],
};

const INITIAL_MEMBERS: UserProfile[] = [DEFAULT_ADMIN];
const INITIAL_APPLICATIONS: MembershipApplication[] = [];
const INITIAL_EVENTS: ClubEvent[] = [];
const INITIAL_REGISTRATIONS: EventRegistration[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-welcome",
    title: "WELCOME TO DATIN COMMAND CENTER",
    content: "The official DATIN | Data2Innovate operations workspace is ready. Use the Admin workspace to publish events, review membership applications, and broadcast announcements.",
    priority: "important",
    authorName: "Core Committee",
    authorRole: "Super Administrator",
    publishedAt: "Just now",
    isPinned: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-init",
    actorName: "DATIN Administrator",
    actorRole: "Super Administrator",
    action: "SYSTEM_READY",
    entityType: "settings",
    entityId: "SYS-001",
    details: "DATIN Command Center initialized with a clean production database.",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
  },
];

const INITIAL_SETTINGS: ClubSettings = {
  clubName: "DATIN | Data2Innovate",
  shortDescription: "Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions at BIET.",
  academicYear: "2026 - 2027",
  contactEmail: "datin.club@biet.edu",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  githubUrl: "https://github.com/theshadowquant/DATIN",
  applicationsOpen: true,
};

export function useDatinStore() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("super_admin");
  const [activeMemberId, setActiveMemberId] = useState<string>("admin-01");
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

  // Sync to localStorage
  const saveToStorage = useCallback(
    (state: Record<string, unknown>) => {
      try {
        localStorage.setItem("datin_store_clean_v2", JSON.stringify(state));
      } catch (e) {
        console.warn("Storage sync failed", e);
      }
    },
    []
  );

  // Load from localStorage or Supabase
  useEffect(() => {
    try {
      // Clear legacy sample key
      localStorage.removeItem("datin_store_v1");

      const saved = localStorage.getItem("datin_store_clean_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members && parsed.members.length > 0) setMembers(parsed.members);
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
      console.warn("Local cache read notice:", e);
    }
    setIsLoaded(true);

    // Asynchronously fetch from Supabase if configured
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

          const { data: dbEvents } = await supabase.from("events").select("*");
          if (dbEvents && dbEvents.length > 0) {
            setEvents(
              dbEvents.map((e: any) => ({
                id: e.id,
                title: e.title,
                slug: e.slug,
                description: e.description,
                category: e.category,
                date: e.date,
                time: e.time,
                venue: e.venue,
                capacity: e.capacity,
                registeredCount: e.registered_count || 0,
                isRegistrationOpen: e.is_registration_open,
                isPublished: e.is_published,
              }))
            );
          }

          const { data: dbTasks } = await supabase.from("tasks").select("*");
          if (dbTasks && dbTasks.length > 0) {
            setTasks(
              dbTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                domain: t.domain,
                assignedToName: t.assigned_to_name,
                assignedToEmail: t.assigned_to_email,
                priority: t.priority,
                status: t.status,
                dueDate: t.due_date,
                updatedAt: t.updated_at || "",
              }))
            );
          }

          const { data: dbAnn } = await supabase.from("announcements").select("*");
          if (dbAnn && dbAnn.length > 0) {
            setAnnouncements(
              dbAnn.map((an: any) => ({
                id: an.id,
                title: an.title,
                content: an.content,
                priority: an.priority,
                authorName: an.author_name,
                authorRole: an.author_role,
                publishedAt: an.published_at,
                isPinned: an.is_pinned,
              }))
            );
          }

          const { data: dbAudit } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });
          if (dbAudit && dbAudit.length > 0) {
            setAuditLogs(
              dbAudit.map((l: any) => ({
                id: l.id,
                actorName: l.actor_name,
                actorRole: l.actor_role,
                action: l.action,
                entityType: l.entity_type,
                entityId: l.entity_id,
                details: l.details,
                timestamp: l.timestamp,
              }))
            );
          }
        } catch (err) {
          console.warn("Supabase background sync:", err);
        }
      })();
    }
  }, []);

  const logAction = useCallback(
    (action: string, entityType: AuditLog["entityType"], entityId: string, details: string) => {
      const activeMember = members.find((m) => m.id === activeMemberId) || DEFAULT_ADMIN;
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
            if (error) console.warn("Supabase audit log insert:", error.message);
          });
      }
    },
    [activeMemberId, auditLogs, currentUserRole, members, applications, events, registrations, tasks, announcements, settings, saveToStorage]
  );

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
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
    logAction("APPLICATION_REJECTED", "application", appId, `Rejected application for ${target.name}. Reason: ${notes || "Submission rejected"}`);

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
    const activeMember = members.find((m) => m.id === activeMemberId) || DEFAULT_ADMIN;
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

  const createEvent = (eventData: Omit<ClubEvent, "id" | "registeredCount">) => {
    const newEvent: ClubEvent = {
      ...eventData,
      id: "evt-" + Date.now().toString(),
      registeredCount: 0,
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    logAction("EVENT_CREATED", "event", newEvent.id, `Created event "${newEvent.title}"`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("events").insert({
        id: newEvent.id,
        title: newEvent.title,
        slug: newEvent.slug,
        description: newEvent.description,
        category: newEvent.category,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        capacity: newEvent.capacity,
        registered_count: 0,
        is_registration_open: newEvent.isRegistrationOpen,
        is_published: newEvent.isPublished,
      });
    }
    return newEvent;
  };

  const createTask = (taskData: Omit<Task, "id" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: "tsk-" + Date.now().toString(),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    logAction("TASK_CREATED", "task", newTask.id, `Created task "${newTask.title}" for ${newTask.assignedToName}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("tasks").insert({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        domain: newTask.domain,
        assigned_to_name: newTask.assignedToName,
        assigned_to_email: newTask.assignedToEmail,
        priority: newTask.priority,
        status: newTask.status,
        due_date: newTask.dueDate,
      });
    }
    return newTask;
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
    logAction("APPLICATION_SUBMITTED", "application", newApp.id, `Application submitted by ${newApp.name} (${newApp.email})`);

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

  const resetToCleanSlate = () => {
    try {
      localStorage.removeItem("datin_store_v1");
      localStorage.removeItem("datin_store_clean_v2");
    } catch (e) {}
    setMembers(INITIAL_MEMBERS);
    setApplications(INITIAL_APPLICATIONS);
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setTasks(INITIAL_TASKS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserRole("super_admin");
    setActiveMemberId("admin-01");
  };

  const activeMember = members.find((m) => m.id === activeMemberId) || DEFAULT_ADMIN;

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
    createEvent,
    createTask,
    submitApplication,
    resetToCleanSlate,
    setSettings,
  };
}
