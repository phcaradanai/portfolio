import { describe, expect, it } from "vitest";
import { findSecrets } from "@/lib/secrets";

const rules = (s: string) => findSecrets(s).map((f) => f.rule);

describe("findSecrets", () => {
  it("passes ordinary prose and the owner's email", () => {
    expect(findSecrets("Contact phcaradanai@gmail.com about v1.2.3 on 127.0.0.1")).toEqual([]);
  });
  it("catches LAN addresses", () => expect(rules("open http://192.168.10.150:3107")).toContain("ipv4"));
  it("catches phone numbers in any format", () => {
    expect(rules("+66 (0)92-546-3952")).toContain("phone");
    expect(rules("0925463952")).toContain("phone");
  });
  it("catches tokens, passwords, vercel ids and home paths", () => {
    expect(rules("gho_" + "a".repeat(30))).toContain("github-token");
    expect(rules("password123 and password: hunter22")).toContain("password-assignment");
    expect(rules("prj_jNQw6n5ca0UKJSLfeokArWdrEm9N")).toContain("vercel-id");
    expect(rules("/Users/somebody/src")).toContain("home-path");
  });
  it("ignores password fields assigned from code and escaped angle brackets", () => {
    expect(findSecrets("s.password=r.password,s.host=r.host; {password:!0,range:!0}; e.password=n.getPassword()")).toEqual([]);
    expect(findSecrets("Co-Authored-By: Claude \\u003cnoreply@anthropic.com\\u003e")).toEqual([]);
  });
  it("catches other people's emails", () => expect(rules("mail a@b.example")).toContain("email"));
});
