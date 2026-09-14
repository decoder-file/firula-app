import MockAdapter from "axios-mock-adapter";

import { apiClient } from "@/api/client";
import { votingService } from "@/services/voting.service";

const mock = new MockAdapter(apiClient);

describe("votingService", () => {
  beforeEach(() => mock.reset());
  afterAll(() => mock.restore());

  it("getEdition unwraps the envelope", async () => {
    mock.onGet("/public/voting/editions/cme/2026").reply(200, { success: true, data: { id: "ed-1", categories: [], me: null } });
    await expect(votingService.getEdition("cme", "2026")).resolves.toEqual(expect.objectContaining({ id: "ed-1" }));
  });

  it("submitVote posts the submissionId and selections (no captcha token from the app)", async () => {
    mock.onPost("/public/voting/categories/cat-1/votes").reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ submissionId: "app-1", selections: [{ positionId: "p", playerId: "j" }] });
      return [201, { success: true, data: { id: "vote-1" } }];
    });
    await expect(votingService.submitVote("cat-1", { submissionId: "app-1", selections: [{ positionId: "p", playerId: "j" }] })).resolves.toEqual({ id: "vote-1" });
  });

  it("getMyVoteForCategory returns null when there is no vote", async () => {
    mock.onGet("/public/voting/categories/cat-1/my-vote").reply(200, { success: true, data: null });
    await expect(votingService.getMyVoteForCategory("cat-1")).resolves.toBeNull();
  });

  it("uploadShareImage sends multipart with the variant as query", async () => {
    mock.onPost("/public/voting/votes/vote-1/share-image").reply((config) => {
      expect(config.params).toEqual({ variant: "9x16" });
      return [201, { success: true, data: { shareId: "abc" } }];
    });
    await expect(votingService.uploadShareImage("vote-1", "9x16", "file:///tmp/card.png")).resolves.toEqual({ shareId: "abc" });
  });
});
