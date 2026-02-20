import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, beforeEach } from "vitest";
import { api, auth } from "./api";

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

describe("auth.getTokens", () => {
  beforeEach(() => {
    localStorage.clear();
    api.defaults.adapter = undefined;
  });

  it("returns null for malformed token storage without throwing", () => {
    localStorage.setItem("tokens", "{bad-json");

    expect(() => auth.getTokens()).not.toThrow();
    expect(auth.getTokens()).toBeNull();
  });

  it("clears tokens when a 401 happens and no refresh token is available", async () => {
    localStorage.setItem("tokens", JSON.stringify({ access: "access-only" }));

    api.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        unauthorizedResponse(config),
      );
    };

    await expect(api.get("/protected")).rejects.toBeDefined();
    expect(auth.getTokens()).toBeNull();
    expect(localStorage.getItem("tokens")).toBeNull();
  });
});
