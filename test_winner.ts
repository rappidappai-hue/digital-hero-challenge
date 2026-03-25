import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const run = async () => {
    // 1. Get any user
    const { data: profiles } = await supabase.from('profiles').select('id, user_id').limit(1);
    if (!profiles || profiles.length === 0) return console.log("No users found");
    const userId = profiles[0].user_id;

    // 2. Get any draw, or make a fake one manually if none exist (UUID requirement)
    // For simplicity, let's just create a dummy draw
    const { data: draw } = await supabase.from('draws').insert({
        draw_date: new Date().toISOString().split('T')[0],
        logic_type: 'random',
        winning_numbers: [1, 2, 3, 4, 5],
        prize_pool_total: 5000,
        status: 'published'
    }).select().single();

    if (!draw) return console.log("Failed to create dummy draw");

    // 3. Insert a pending winner for that user
    const { error } = await supabase.from('winners').insert({
        draw_id: draw.id,
        user_id: userId,
        match_count: 5,
        prize_amount: 5000,
        payout_status: 'pending'
    });

    if (error) console.error("Error creating winner:", error);
    else console.log("Successfully injected a Top-Tier Pending Winner! Check the User Dashboard!");
}
run();
