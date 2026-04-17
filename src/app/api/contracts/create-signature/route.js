/**
 * POST /api/contracts/create-signature
 *
 * Thin proxy that delegates to the core contract-creation logic.
 * The frontend <SendContractModal> calls this endpoint to create a
 * Documenso envelope and receive back the { signingUrl, documentId }.
 *
 * Accepts the same JSON body as /api/contracts/create:
 *   { userId, clientEmail, clientName, pdfBase64 }
 */

export { POST } from "../create/route";
