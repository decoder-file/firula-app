import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import type { EventData, UserTicket } from "@/data/mockData";
import { formatDateWithYear } from "@/utils/format";

interface PassData {
  eventName: string;
  ticketType: string;
  eventDate: string;
  eventTime: string;
  location: string;
  address: string;
  city: string;
  qrCode: string;
  ticketId: string;
  purchaseDate: string;
  requiresFacialId: boolean;
}

function buildPassData(ticket: UserTicket, event: EventData): PassData {
  return {
    eventName: event.title,
    ticketType: ticket.ticketType,
    eventDate: event.date,
    eventTime: event.time,
    location: event.location,
    address: event.address,
    city: event.city,
    qrCode: ticket.qrCode,
    ticketId: ticket.id,
    purchaseDate: ticket.purchaseDate,
    requiresFacialId: event.requiresFacialId ?? false,
  };
}

/**
 * Builds the Apple Wallet pass.json structure.
 * To generate a valid .pkpass file, this JSON must be signed on a backend with
 * your Apple Developer Pass Type ID certificate.
 *
 * Backend integration (when ready):
 *   const { data } = await api.post('/wallet/apple/generate', { ticketId: ticket.id });
 *   await Linking.openURL(data.passUrl); // opens Apple Wallet automatically for .pkpass URLs
 */
export function buildApplePassJson(data: PassData): object {
  const accessDescription = data.requiresFacialId
    ? "Acesso via Facial ID Firula"
    : "Apresente o QR Code na entrada";

  return {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.firula.ticket", // TODO: replace with your Pass Type ID
    serialNumber: data.ticketId,
    teamIdentifier: "XXXXXXXXXX", // TODO: replace with your Apple Team ID
    organizationName: "Firula",
    description: `Ingresso – ${data.eventName}`,
    foregroundColor: "rgb(31, 189, 88)",
    backgroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(100, 100, 100)",
    logoText: "Firula",
    eventTicket: {
      headerFields: [
        {
          key: "ticket-type",
          label: "TIPO",
          value: data.ticketType,
        },
      ],
      primaryFields: [
        {
          key: "event-name",
          label: "EVENTO",
          value: data.eventName,
        },
      ],
      secondaryFields: [
        {
          key: "event-date",
          label: "DATA",
          value: `${formatDateWithYear(data.eventDate)} – ${data.eventTime}`,
        },
        {
          key: "event-location",
          label: "LOCAL",
          value: data.location,
        },
      ],
      auxiliaryFields: [
        {
          key: "event-address",
          label: "ENDEREÇO",
          value: `${data.address} – ${data.city}`,
        },
        {
          key: "access-method",
          label: "ACESSO",
          value: accessDescription,
        },
      ],
      backFields: [
        {
          key: "ticket-id",
          label: "CÓDIGO DO INGRESSO",
          value: data.qrCode,
        },
        {
          key: "purchase-date",
          label: "DATA DA COMPRA",
          value: formatDateWithYear(data.purchaseDate),
        },
        {
          key: "terms",
          label: "TERMOS",
          value: "Este ingresso é pessoal e intransferível. Sujeito às regras do evento.",
        },
      ],
    },
    ...(data.requiresFacialId
      ? {}
      : {
          barcode: {
            message: data.qrCode,
            format: "PKBarcodeFormatQR",
            messageEncoding: "iso-8859-1",
            altText: data.qrCode,
          },
          barcodes: [
            {
              message: data.qrCode,
              format: "PKBarcodeFormatQR",
              messageEncoding: "iso-8859-1",
              altText: data.qrCode,
            },
          ],
        }),
  };
}

/**
 * Builds the Google Wallet Generic Pass payload structure.
 * To save to Google Wallet, this payload must be signed as a JWT on a backend
 * with your Google Cloud service account, then opened via:
 * https://pay.google.com/gp/v/save/{jwt}
 *
 * Backend integration (when ready):
 *   const { data } = await api.post('/wallet/google/generate', { ticketId: ticket.id });
 *   await Linking.openURL(`https://pay.google.com/gp/v/save/${data.jwt}`);
 */
export function buildGooglePassPayload(data: PassData): object {
  const accessDescription = data.requiresFacialId
    ? "Acesso via Facial ID Firula"
    : `QR Code: ${data.qrCode}`;

  return {
    // TODO: replace iss with your Google service account email
    iss: "firula-wallet@firula-app.iam.gserviceaccount.com",
    aud: "google",
    typ: "savetowallet",
    payload: {
      genericObjects: [
        {
          // TODO: replace issuer-id with your Google Wallet issuer ID
          id: `issuer-id.${data.ticketId}`,
          classId: "issuer-id.FirulaEventTicket",
          genericType: "GENERIC_TYPE_UNSPECIFIED",
          hexBackgroundColor: "#1FBD58",
          logo: {
            sourceUri: {
              // TODO: replace with actual hosted logo URL
              uri: "https://firula.com.br/logo.png",
            },
          },
          cardTitle: {
            defaultValue: { language: "pt-BR", value: "Firula" },
          },
          subheader: {
            defaultValue: { language: "pt-BR", value: data.ticketType },
          },
          header: {
            defaultValue: { language: "pt-BR", value: data.eventName },
          },
          ...(data.requiresFacialId
            ? {}
            : {
                barcode: {
                  type: "QR_CODE",
                  value: data.qrCode,
                  alternateText: data.qrCode,
                },
              }),
          textModulesData: [
            {
              id: "event_date",
              header: "DATA E HORÁRIO",
              body: `${formatDateWithYear(data.eventDate)} às ${data.eventTime}`,
            },
            {
              id: "location",
              header: "LOCAL",
              body: `${data.location} – ${data.address}`,
            },
            {
              id: "access",
              header: "ACESSO",
              body: accessDescription,
            },
          ],
          validTimeInterval: {
            start: { date: `${data.eventDate}T00:00:00Z` },
          },
        },
      ],
    },
  };
}

/**
 * Fallback: shares ticket details as a formatted text file via the native share sheet.
 * This is the current working implementation until backend signing is available.
 */
async function shareTicketAsText(data: PassData): Promise<void> {
  const accessLine = data.requiresFacialId
    ? "Acesso: Facial ID Firula"
    : `QR Code: ${data.qrCode}`;

  const lines = [
    "🎟  INGRESSO FIRULA",
    "",
    `Evento:     ${data.eventName}`,
    `Tipo:       ${data.ticketType}`,
    `Data:       ${formatDateWithYear(data.eventDate)} às ${data.eventTime}`,
    `Local:      ${data.location}`,
    `Endereço:   ${data.address} – ${data.city}`,
    "",
    accessLine,
    "",
    `ID:         ${data.ticketId}`,
    `Comprado em: ${formatDateWithYear(data.purchaseDate)}`,
    "",
    "Este ingresso é pessoal e intransferível.",
  ];

  const fileName = `ingresso-${data.ticketId}.txt`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, lines.join("\n"), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Compartilhamento não disponível neste dispositivo.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/plain",
    dialogTitle: "Salvar ingresso",
    UTI: "public.plain-text",
  });
}

/**
 * Main entry point. Adds a ticket to the device's wallet.
 *
 * Current behaviour (prototype):
 *   - Logs the platform-specific pass structure to the console for inspection.
 *   - Shares the ticket as a formatted text file via the native share sheet.
 *
 * Production upgrade path:
 *   - iOS:     Replace shareTicketAsText() with a signed .pkpass URL from your backend.
 *   - Android: Replace shareTicketAsText() with the signed JWT URL from your backend.
 */
export async function addToWallet(ticket: UserTicket, event: EventData): Promise<void> {
  const data = buildPassData(ticket, event);

  if (Platform.OS === "ios") {
    console.log("[WalletPass] Apple pass.json:", JSON.stringify(buildApplePassJson(data), null, 2));
    await shareTicketAsText(data);
  } else if (Platform.OS === "android") {
    console.log("[WalletPass] Google pass payload:", JSON.stringify(buildGooglePassPayload(data), null, 2));
    await shareTicketAsText(data);
  } else {
    await shareTicketAsText(data);
  }
}
