import { supabase } from "@/integrations/supabase/client";

export const executeDraw = async (drawId: string, winningNumbers: number[], totalPool: number) => {
  // 1. Get all active subscriptions and their users
  const { data: subs } = await supabase.from("subscriptions").select("user_id").eq("status", "active");
  if (!subs) return;
  const activeUserIds = subs.map(s => s.user_id);

  if (activeUserIds.length === 0) return;

  // 2. Get the latest 5 scores for each active user
  const { data: scores } = await supabase
    .from("golf_scores")
    .select("user_id, score, played_date")
    .in("user_id", activeUserIds)
    .order("played_date", { ascending: false });

  if (!scores) return;

  // Group scores by user id (take only top 5)
  const userScores: Record<string, number[]> = {};
  scores.forEach(s => {
    if (!userScores[s.user_id]) userScores[s.user_id] = [];
    if (userScores[s.user_id].length < 5) {
      userScores[s.user_id].push(s.score);
    }
  });

  // Calculate prize pool allocations according to PRD
  // 5-match = 40%, 4-match = 35%, 3-match = 25%
  const pool5 = totalPool * 0.40;
  const pool4 = totalPool * 0.35;
  const pool3 = totalPool * 0.25;

  const winners5: string[] = [];
  const winners4: string[] = [];
  const winners3: string[] = [];

  // Match scores
  for (const [userId, uScores] of Object.entries(userScores)) {
    // Exact matching subset logic
    let matches = 0;
    const drawnCopy = [...winningNumbers];
    uScores.forEach(score => {
      const idx = drawnCopy.indexOf(score);
      if (idx !== -1) {
        matches++;
        drawnCopy.splice(idx, 1); // remove to prevent double counting
      }
    });

    if (matches === 5) winners5.push(userId);
    else if (matches === 4) winners4.push(userId);
    else if (matches === 3) winners3.push(userId);
  }

  // Calculate exact splits
  const payout5 = winners5.length > 0 ? (pool5 / winners5.length) : 0;
  const payout4 = winners4.length > 0 ? (pool4 / winners4.length) : (pool4); // PRD: No rollover for 4 or 3 match if no winners? Wait, PRD says: "5-match jackpot carries forward if unclaimed", "4-number no rollover", "3-number no rollover". If no winners, does it just stay with the house? Let's assume payouts are 0 if no winners for 4 and 3.
  const payout3 = winners3.length > 0 ? (pool3 / winners3.length) : 0;

  // Insert winners
  const records = [];

  for (const w of winners5) records.push({ draw_id: drawId, user_id: w, match_count: 5, prize_amount: payout5, payout_status: 'pending' });
  for (const w of winners4) records.push({ draw_id: drawId, user_id: w, match_count: 4, prize_amount: payout4, payout_status: 'pending' });
  for (const w of winners3) records.push({ draw_id: drawId, user_id: w, match_count: 3, prize_amount: payout3, payout_status: 'pending' });

  if (records.length > 0) {
    await supabase.from("winners").insert(records);
  }

  // Calculate rollover
  const rollover = winners5.length === 0 ? pool5 : 0;

  // Record entered users to `draw_entries` for their participation record
  const entries = activeUserIds.map(uid => ({
    draw_id: drawId,
    user_id: uid,
    scores: userScores[uid] ?? []
  }));

  if (entries.length > 0) {
    await supabase.from("draw_entries").insert(entries);
  }

  await supabase.from("draws").update({ rollover_amount: rollover, jackpot_amount: pool5 }).eq("id", drawId);
};
