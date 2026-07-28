const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  "https://yauoswqvuwruufozwduu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo"
);

const GIFS_DIR = path.join(process.cwd(), "assets", "spartan", "gifs");
const BUCKET = "exercise_gifs";

function cleanName(filename) {
  return path.basename(filename, ".gif")
    .replace(/\s*\(\d+\)\s*/g, "")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function inferEquipment(name) {
  const lower = name.toLowerCase();
  if (/barra|pesas|discos|mancuerna/.test(lower)) return "mancuerna/barra";
  if (/máquina|maquina|polea|cable|smith|prensa|extension/.test(lower)) return "máquina";
  if (/banda|elástica|elastica|resistencia/.test(lower)) return "banda elástica";
  if (/peso corporal|calistenia|dominada|flexión|plancha|sentadilla|burpee|fondo|barra fija/.test(lower)) return "peso corporal";
  return "peso corporal";
}

function inferDifficulty(name) {
  const lower = name.toLowerCase();
  if (/avanzado|intenso|pesado|máximo/.test(lower)) return "avanzado";
  if (/principiante|básico|basico|fácil|facil|inicial/.test(lower)) return "principiante";
  return "intermedio";
}

async function upload() {
  const folders = fs.readdirSync(GIFS_DIR).filter((f) => {
    const stat = fs.statSync(path.join(GIFS_DIR, f));
    return stat.isDirectory();
  });

  console.log(`Folders found: ${folders.length}\n`);

  const exercises = [];
  let uploaded = 0;
  let failed = 0;
  const total = folders.reduce((sum, f) => sum + fs.readdirSync(path.join(GIFS_DIR, f)).filter((x) => x.endsWith(".gif")).length, 0);

  for (const folder of folders) {
    const muscleGroup = folder.charAt(0).toUpperCase() + folder.slice(1).toLowerCase();
    const files = fs.readdirSync(path.join(GIFS_DIR, folder)).filter((f) => f.endsWith(".gif"));

    for (const file of files) {
      const name = cleanName(file);
      const storagePath = `${muscleGroup}/${file}`;
      const localPath = path.join(GIFS_DIR, folder, file);
      const fileBuffer = fs.readFileSync(localPath);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: "image/gif",
          upsert: true,
        });

      if (error) {
        console.error(`FAIL: ${storagePath} - ${error.message}`);
        failed++;
        continue;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

      exercises.push({
        name,
        muscle_group: muscleGroup,
        equipment: inferEquipment(name),
        difficulty: inferDifficulty(name),
        gif_url: urlData.publicUrl,
      });

      uploaded++;
      process.stdout.write(`\r[${uploaded}/${total}] ${storagePath}`);
    }
  }

  console.log(`\n\nUpload complete: ${uploaded} success, ${failed} failed`);

  // Save metadata to JSON for insert
  const outputPath = path.join(process.cwd(), "assets", "spartan", "exercises_metadata.json");
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  console.log(`Metadata saved to: ${outputPath}`);

  // Bulk insert into database
  console.log("\nInserting into spartan_exercise_library...");
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    const { error: insertErr } = await supabase.from("spartan_exercise_library").insert(batch);

    if (insertErr) {
      console.error(`Batch insert error at ${i}-${i + batch.length}:`, insertErr.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\rInserted: ${inserted}/${exercises.length}`);
    }
  }

  console.log(`\nDone! ${inserted} exercises in database.`);
}

upload().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
