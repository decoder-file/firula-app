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
}

export interface PublicProfileFollower {
  identityId: string;
  username: string | null;
  name: string;
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
  name: string;
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
