import { env } from "@/lib/env";
import { roomName } from "@/lib/i18n";
import { ensureSchema } from "@/lib/config";
import { validDate, nightsBetween, todayISO } from "@/lib/dates";
import { activeRooms, isFree, quote } from "@/lib/availability";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const ci = u.searchParams.get("checkIn");
  const co = u.searchParams.get("checkOut");
  const guests = Number(u.searchParams.get("guests") ?? 1);
  const en = u.searchParams.get("lang") === "en";
  if (!validDate(ci) || !validDate(co) || ci < todayISO() || nightsBetween(ci, co) < 1 || nightsBetween(ci, co) > 60)
    return Response.json({ error: "Date non valide" }, { status: 400 });
  await ensureSchema();
  const db = env().DB;
  const out = [];
  for (const room of await activeRooms(db)) {
    if (room.capacity < guests) continue;
    const q = await quote(db, room, ci, co);
    const free = await isFree(db, room.id, ci, co);
    out.push({
      id: room.id, name: roomName(room.name, en ? "en" : "it"), description: (en && room.description_en) || room.description, capacity: room.capacity,
      amenities: JSON.parse((en && room.amenities_en !== "[]" && room.amenities_en) || room.amenities), photos: JSON.parse(room.photos),
      available: free && q.nights >= q.min_nights, min_nights: q.min_nights,
      total_cents: q.total_cents, nights: q.nights,
    });
  }
  return Response.json({ rooms: out });
}
