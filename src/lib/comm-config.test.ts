import { afterEach, describe, expect, it } from "vitest";
import {
  e164DisplayFromRaw,
  getWhatsAppDeliveryE164Display,
  getWhatsAppDeliveryTo,
  normalizeWhatsAppToAddress,
} from "./comm-config";

describe("comm-config", () => {
  const prev = process.env.TWILIO_WHATSAPP_TO;

  afterEach(() => {
    if (prev === undefined) delete process.env.TWILIO_WHATSAPP_TO;
    else process.env.TWILIO_WHATSAPP_TO = prev;
  });

  it("normalizeWhatsAppToAddress accepts whatsapp: prefix", () => {
    expect(normalizeWhatsAppToAddress("whatsapp:+919967784178")).toBe("whatsapp:+919967784178");
  });

  it("normalizeWhatsAppToAddress accepts E.164", () => {
    expect(normalizeWhatsAppToAddress("+1 (555) 123-4567")).toBe("whatsapp:+15551234567");
  });

  it("e164DisplayFromRaw strips formatting", () => {
    expect(e164DisplayFromRaw("whatsapp:+91 99677 84178")).toBe("+919967784178");
  });

  it("getWhatsAppDeliveryTo reads env", () => {
    process.env.TWILIO_WHATSAPP_TO = "+919967784178";
    expect(getWhatsAppDeliveryTo()).toBe("whatsapp:+919967784178");
  });

  it("getWhatsAppDeliveryTo throws when env unset", () => {
    delete process.env.TWILIO_WHATSAPP_TO;
    expect(() => getWhatsAppDeliveryTo()).toThrow(/TWILIO_WHATSAPP_TO/);
  });

  it("getWhatsAppDeliveryE164Display returns em dash when unset", () => {
    delete process.env.TWILIO_WHATSAPP_TO;
    expect(getWhatsAppDeliveryE164Display()).toBe("—");
  });
});
