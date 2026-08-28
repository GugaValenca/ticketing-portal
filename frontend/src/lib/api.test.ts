import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, beforeEach } from "vitest";
import { api } from "./api";

function unauthorizedResponse(
  config: InternalAxiosRequestConfig,
): AxiosResponse {
  return {
    data: {},
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config,
  };
}

describe("api request interceptor", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    api.defaults.adapter = undefined;
  });

  it("attaches X-CSRFToken from the csrftoken cookie on unsafe methods", async () => {
    document.cookie = "csrftoken=test-csrf-token; path=/";

    let sentHeaders: Record<string, unknown> = {};
    api.defaults.adapter = async (config) => {
      sentHeaders = config.headers as unknown as Record<string, unknown>;
      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await api.post("/api/tickets/", { title: "test" });

    expect(sentHeaders["X-CSRFToken"]).toBe("test-csrf-token");
  });

  it("does not attach X-CSRFToken on safe methods", async () => {
    document.cookie = "csrftoken=test-csrf-token; path=/";

    let sentHeaders: Record<string, unknown> = {};
    api.defaults.adapter = async (config) => {
      sentHeaders = config.headers as unknown as Record<string, unknown>;
      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await api.get("/api/tickets/");

    expect(sentHeaders["X-CSRFToken"]).toBeUndefined();
  });
});

describe("api response interceptor", () => {
  beforeEach(() => {
    api.defaults.adapter = undefined;
  });

  it("rejects without retrying when a token endpoint itself returns 401", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        unauthorizedResponse(config),
      );
    };

    await expect(api.get("/api/token/refresh/")).rejects.toBeDefined();
  });
});
