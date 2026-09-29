import { env } from "../../config/env";

// EmailTransport (D-006): the domain alerts the team through this interface, never a vendor SDK. A real provider is
// added when the owners choose one (Q1); the recipient is still open (Q12).
export interface EmailTransport {
  queryAlert(query: { id: string; reference: string }): Promise<void>;
}

// Development only. Logs that an alert was due, with the internal id and nothing personal (INVARIANT 11).
export function consoleTransport(teamInbox: string | undefined): EmailTransport {
  return {
    async queryAlert({ id }) {
      console.info(
        `[email:console] new query ${id}; alert not sent (console transport); team inbox ${teamInbox ? "configured" : "not set (Q12)"}`
      );
    },
  };
}

export function emailTransport(): EmailTransport {
  const { EMAIL_TRANSPORT, EMAIL_TEAM_INBOX } = env();
  switch (EMAIL_TRANSPORT) {
    case "console":
      return consoleTransport(EMAIL_TEAM_INBOX);
  }
}
