export type UserRole = 
  | 'super_admin' 
  | 'core_committee' 
  | 'domain_lead' 
  | 'member' 
  | 'public';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  academicYear: string;
  domain: string;
  role: UserRole;
  status: 'active' | 'pending' | 'suspended';
  membershipId: string;
  joinedAt: string;
  skills: string[];
}

export interface MemberPass {
  passId: string;
  memberId: string;
  memberName: string;
  membershipId: string;
  domain: string;
  roleName: string;
  verificationToken: string;
  status: 'valid' | 'revoked';
  issuedAt: string;
  term: string;
}

export interface MembershipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  academicYear: string;
  domain: string;
  skills: string;
  statement: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Meetup' | 'Tech Talk';
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  isRegistrationOpen: boolean;
  isPublished: boolean;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  attendanceStatus: 'present' | 'absent';
  registeredAt: string;
  checkedInAt?: string;
}

export type TaskStatus = 'to_do' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  domain: string;
  assignedToName: string;
  assignedToEmail: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  authorName: string;
  authorRole: string;
  publishedAt: string;
  isPinned: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'application' | 'member' | 'event' | 'task' | 'attendance' | 'settings';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface ClubSettings {
  clubName: string;
  shortDescription: string;
  academicYear: string;
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  applicationsOpen: boolean;
}
