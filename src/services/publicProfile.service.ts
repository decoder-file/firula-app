import { apiClient } from "@/api/client";

export interface PublicProfileAttendedEvent {
  id: string;
  name: string;
  slug: string | null;
  startsAt: string;
  organizationName: string;
  coverUrl: string | null;
}

export interface PublicProfileOrganization {
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface PublicProfile {
  username: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  socialLinks: { instagram: string | null; x: string | null };
  location: { city: string | null; state: string | null } | null;
  attendedEvents: PublicProfileAttendedEvent[];
  followedOrganizations: PublicProfileOrganization[];
  followersCount: number;
  followingCount: number;
  hasPublicContent: boolean;
}

export interface FollowActionResult {
  following: boolean;
}

export interface FollowStatusResult {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  hasReported: boolean;
}

export interface RemoveFollowerResult {
  removed: boolean;
}

export interface BlockActionResult {
  isBlocked: boolean;
}

export type CustomerReportReason = "SPAM" | "INAPPROPRIATE_CONTENT" | "HARASSMENT" | "FAKE_PROFILE" | "OTHER";

export interface ReportActionResult {
  reported: boolean;
}

export interface PublicProfileFollower {
  identityId: string;
  username: string | null;
  name: string | null;
  photoUrl: string | null;
  followedAt: string;
  isFollowing: boolean;
}

export interface FollowersPage {
  total: number;
  skip: number;
  take: number;
  followers: PublicProfileFollower[];
}

export interface PublicProfileFollowingPerson {
  type: "CUSTOMER";
  identityId: string;
  username: string | null;
  name: string | null;
  photoUrl: string | null;
  followedAt: string;
  isFollowing: boolean;
}

export interface PublicProfileFollowingOrganization {
  type: "ORGANIZATION";
  slug: string;
  name: string;
  logoUrl: string | null;
  followedAt: string;
}

export interface FollowingPage {
  total: number;
  peopleTotal: number;
  organizationsTotal: number;
  skip: number;
  take: number;
  following: PublicProfileFollowingPerson[];
  followingOrganizations: PublicProfileFollowingOrganization[];
}

export const publicProfileService = {
  getByUsername: async (username: string): Promise<PublicProfile> => {
    const { data } = await apiClient.get(`/public/profiles/${username}`);
    return data.data;
  },

  getFollowStatus: async (username: string): Promise<FollowStatusResult> => {
    const { data } = await apiClient.get(`/public/profiles/${username}/follow-status`);
    return data.data;
  },

  follow: async (username: string): Promise<FollowActionResult> => {
    const { data } = await apiClient.post(`/public/profiles/${username}/follow`);
    return data.data;
  },

  unfollow: async (username: string): Promise<FollowActionResult> => {
    const { data } = await apiClient.delete(`/public/profiles/${username}/follow`);
    return data.data;
  },

  removeFollower: async (username: string): Promise<RemoveFollowerResult> => {
    const { data } = await apiClient.delete(`/public/profiles/${username}/remove-follower`);
    return data.data;
  },

  block: async (username: string): Promise<BlockActionResult> => {
    const { data } = await apiClient.post(`/public/profiles/${username}/block`);
    return data.data;
  },

  unblock: async (username: string): Promise<BlockActionResult> => {
    const { data } = await apiClient.delete(`/public/profiles/${username}/block`);
    return data.data;
  },

  report: async (username: string, reason: CustomerReportReason, details?: string): Promise<ReportActionResult> => {
    const { data } = await apiClient.post(`/public/profiles/${username}/report`, { reason, details });
    return data.data;
  },

  getFollowers: async (username: string, skip = 0, take = 20): Promise<FollowersPage> => {
    const { data } = await apiClient.get(`/public/profiles/${username}/followers`, {
      params: { skip, take },
    });
    return data.data;
  },

  getFollowing: async (username: string, skip = 0, take = 20): Promise<FollowingPage> => {
    const { data } = await apiClient.get(`/public/profiles/${username}/following`, {
      params: { skip, take },
    });
    return data.data;
  },
};
