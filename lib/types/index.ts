// DATIN Command Center — Strict Two-Role Type Definitions

export type UserRole = 'coordinator' | 'participant';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  usn?: string;
  college: string;
  department: string;
  academicYear: number | string;
  phone?: string;
  role: UserRole;
  passToken: string;
  membershipId?: string;
  domain?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
  joinedAt?: string;
  accountStatus?: 'active' | 'suspended';
  membershipStatus?: 'approved' | 'pending' | 'rejected';
  status?: string;
  skills?: string[];
}

export type TeamFormat = 'solo' | 'duo' | 'squad_4' | 'flexible';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  teamFormat: TeamFormat;
  minTeamSize: number;
  maxTeamSize: number;
  venue: string;
  date: string;
  time: string;
  capacity: number; // Max total teams or participants
  registeredCount: number;
  isRegistrationOpen: boolean;
  isPublished: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userUsn?: string;
  userPhone?: string;
  joinedAt: string;
}

export interface TeamItem {
  id: string;
  eventId: string;
  eventTitle?: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  leaderName?: string;
  isFinalized: boolean;
  members: TeamMember[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle?: string;
  userId: string;
  userName?: string;
  userUsn?: string;
  userEmail?: string;
  scannedBy?: string;
  scannedByName?: string;
  notes?: string;
  scannedAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  authorId?: string;
  authorName: string;
  authorRole?: string;
  publishedAt?: string;
  isPinned: boolean;
  createdAt: string;
}

export type Announcement = AnnouncementItem;

export interface AuditRecord {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface CoordinatorInvite {
  id: string;
  email: string;
  invitedBy?: string;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}
