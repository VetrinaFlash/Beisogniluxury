import { eachNight, nightsBetween } from "./dates";

export interface Room {
  id: string; name: string; description: string; description_en: string; capacity: number;
  base_price_cents: number; min_nights: number; amenities: string; amenities_en: string; photos: string;
}

export async function activeRooms(db: D1Database): Promise<Room[]> {
  const r = await db.prepare("SELECT * FROM rooms WHERE active=1 ORDER BY sort,name").all<Room>();
  return r.results;
}

export async function isFree(db: D1Database, roomId: string, ci: string, co: string): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM bookings WHERE room_id=?1 AND status IN ('pending','confirmed') AND ?2 < check_out AND ?3 > check_in) +
        (SELECT COUNT(*) FROM blocks WHERE room_id=?1 AND ?2 < to_date AND ?3 > from_date) AS n`
    )
    .bind(roomId, ci, co)
    .first<{ n: number }>();
  return (row?.n ?? 1) === 0;
}

/** Total for the stay in cents, using seasonal prices (to_date is exclusive) over the base price. Also returns the strictest min nights. */
export async function quote(db: D1Database, room: Room, ci: string, co: string) {
  const seasons = await db
    .prepare("SELECT from_date,to_date,price_cents,min_nights FROM season_prices WHERE room_id=?1 AND ?2 < to_date AND ?3 > from_date")
    .bind(room.id, ci, co)
    .all<{ from_date: string; to_date: string; price_cents: number; min_nights: number | null }>();
  let total = 0;
  let minNights = room.min_nights;
  for (const night of eachNight(ci, co)) {
    const s = seasons.results.find((x) => night >= x.from_date && night < x.to_date);
    total += s ? s.price_cents : room.base_price_cents;
    if (s?.min_nights && s.min_nights > minNights) minNights = s.min_nights;
  }
  return { total_cents: total, nights: nightsBetween(ci, co), min_nights: minNights };
}

/** Atomic insert: succeeds only if the room is still free (D1 serialises writes). */
export async function insertBookingIfFree(db: D1Database, b: {
  id: string; room_id: string; check_in: string; check_out: string; guests: number;
  guest_name: string; guest_email: string; guest_phone: string; notes: string; total_cents: number; lang: string;
}): Promise<boolean> {
  const res = await db
    .prepare(
      `INSERT INTO bookings (id,room_id,check_in,check_out,guests,guest_name,guest_email,guest_phone,notes,total_cents,lang)
       SELECT ?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11
       WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE room_id=?2 AND status IN ('pending','confirmed') AND ?3 < check_out AND ?4 > check_in)
         AND NOT EXISTS (SELECT 1 FROM blocks WHERE room_id=?2 AND ?3 < to_date AND ?4 > from_date)`
    )
    .bind(b.id, b.room_id, b.check_in, b.check_out, b.guests, b.guest_name, b.guest_email, b.guest_phone, b.notes, b.total_cents, b.lang)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
