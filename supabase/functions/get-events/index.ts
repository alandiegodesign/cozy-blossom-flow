import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
    const url = new URL(req.url);
    const creatorId = url.searchParams.get("creator_id");

    // Use the postgres module available in Deno edge runtime
    const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
    const sql = postgres(dbUrl, { max: 1 });

    let events;
    if (creatorId) {
      events = await sql`
        SELECT * FROM public.events 
        WHERE deleted_at IS NULL AND created_by = ${creatorId}::uuid
        ORDER BY date ASC
      `;
    } else {
      events = await sql`
        SELECT * FROM public.events 
        WHERE deleted_at IS NULL
        ORDER BY date ASC
      `;
    }

    await sql.end();

    return new Response(JSON.stringify(events), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-events error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
