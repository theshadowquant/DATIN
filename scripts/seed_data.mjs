import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xgbwadomxmtzjlqdwfxb.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYndhZG9teG10empscWR3ZnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjY4MzI0MSwiZXhwIjoyMTA4MjU5MjQxfQ.0bx2pLimBVVZyJC-eGc2gh1tSWvIGMVTAUlREku_qT0";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("Seeding remaining tables...");

  // Events
  const events = [
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
      registered_count: 84,
      is_registration_open: true,
      is_published: true,
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
      registered_count: 45,
      is_registration_open: true,
      is_published: true,
    },
  ];

  const { error: errEvents } = await supabase.from("events").upsert(events);
  if (errEvents) console.error("Events error:", errEvents);
  else console.log("✓ Events seeded");

  // Tasks
  const tasks = [
    {
      id: "tsk-01",
      title: "Deploy Digital Pass QR Verification Service",
      description: "Implement high-contrast verification endpoints with non-guessable HMAC tokens.",
      domain: "Full Stack Innovation",
      assigned_to_name: "Lekhan V T",
      assigned_to_email: "lekhanvt@gmail.com",
      priority: "urgent",
      status: "in_progress",
      due_date: "2026-10-25",
    },
    {
      id: "tsk-02",
      title: "Prepare Datasets for Data Science Boot Camp",
      description: "Curate cleaned Kaggle datasets and EDA starter notebooks for 1st & 2nd year students.",
      domain: "Data Analytics & BI",
      assigned_to_name: "Shraddha R Byadgi",
      assigned_to_email: "shraddhabyadgi@gmail.com",
      priority: "high",
      status: "to_do",
      due_date: "2026-10-27",
    },
    {
      id: "tsk-03",
      title: "Draft Hackathon Problem Statements",
      description: "Collaborate with industry mentors on Healthcare & FinTech challenge statements.",
      domain: "Machine Learning & AI",
      assigned_to_name: "Pratham R Raikar",
      assigned_to_email: "prathamraikar@gmail.com",
      priority: "high",
      status: "in_review",
      due_date: "2026-10-24",
    },
  ];

  const { error: errTasks } = await supabase.from("tasks").upsert(tasks);
  if (errTasks) console.error("Tasks error:", errTasks);
  else console.log("✓ Tasks seeded");

  // Announcements
  const announcements = [
    {
      id: "ann-01",
      title: "WELCOME TO DATIN COMMAND CENTER",
      content: "Official club management platform launched. Access your digital member pass, register for upcoming hackathons, and review active domain projects.",
      priority: "important",
      author_name: "Club President",
      author_role: "Super Administrator",
      published_at: "Just now",
      is_pinned: true,
    },
    {
      id: "ann-02",
      title: "CALL FOR WORKSHOP MENTORS — MODERN DATA PIPELINES",
      content: "Domain leads seeking 2 student facilitators for the upcoming DuckDB & Python pipeline session on Oct 29.",
      priority: "normal",
      author_name: "Shraddha R Byadgi",
      author_role: "Core Committee",
      published_at: "2 hours ago",
      is_pinned: false,
    },
  ];

  const { error: errAnn } = await supabase.from("announcements").upsert(announcements);
  if (errAnn) console.error("Announcements error:", errAnn);
  else console.log("✓ Announcements seeded");

  // Applications
  const apps = [
    {
      id: "app-101",
      name: "Ananya Deshpande",
      email: "ananya.d@student.biet.edu",
      phone: "9123456780",
      department: "Computer Science",
      academic_year: "2nd Year",
      domain: "Machine Learning & AI",
      skills: "Python, PyTorch, Linear Algebra",
      statement: "Interested in contributing to computer vision projects and building club hackathon solutions.",
      status: "pending",
    },
    {
      id: "app-102",
      name: "Kiran Kumar M",
      email: "kiran.km@student.biet.edu",
      phone: "9876501234",
      department: "Information Science",
      academic_year: "1st Year",
      domain: "Data Analytics & BI",
      skills: "Python, SQL basics, Excel",
      statement: "Want to learn exploratory data analysis and participate in club workshops.",
      status: "pending",
    },
  ];

  const { error: errApps } = await supabase.from("membership_applications").upsert(apps);
  if (errApps) console.error("Apps error:", errApps);
  else console.log("✓ Applications seeded");

  console.log("Seeding complete!");
}

seed();
