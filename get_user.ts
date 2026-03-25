import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("Missing Env Vars:", { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY: !!SUPABASE_PUBLISHABLE_KEY });
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const run = async () => {
    console.log("Querying profiles...");
    try {
        const { data: users, error } = await supabase.from('profiles').select('email, id').limit(5);
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Found Users:", JSON.stringify(users, null, 2));
        }
    } catch (err) {
        console.error("Exception:", err);
    }
}
run();
