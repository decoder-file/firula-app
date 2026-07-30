import MockAdapter from "axios-mock-adapter";

import { apiClient } from "@/api/client";
import { isApiError } from "@/api/errors";
import { appConfigService } from "@/services/appConfig.service";
import type { AppConfigResponse } from "@/services/appConfig.service";

const APP_CONFIG_RESPONSE: AppConfigResponse = {
  ios: { minVersion: "1.2.0", storeUrl: "https://apps.apple.com/app/id123" },
  android: {
    minVersion: "1.2.0",
    storeUrl: "https://play.google.com/store/apps/details?id=com.firulaapp",
  },
  updateMessage: "Atualize para a versão mais recente",
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

async function expectToThrow(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    throw new Error("Expected to throw but did not");
  } catch (err) {
    return err;
  }
}

describe("appConfigService.getAppConfig", () => {
  it("unwraps the {success, data} envelope and returns the config", async () => {
    mock.onGet("/public/app-config").reply(200, { success: true, data: APP_CONFIG_RESPONSE });

    const result = await appConfigService.getAppConfig();

    expect(result).toEqual(APP_CONFIG_RESPONSE);
  });

  it("propagates a network/server error instead of swallowing it", async () => {
    mock.onGet("/public/app-config").reply(500, {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Erro interno" },
    });

    const err = await expectToThrow(appConfigService.getAppConfig());

    expect(isApiError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(500);
  });
});
