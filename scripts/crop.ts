/** Cuts a tall screenshot into viewport-height tiles for review: tsx scripts/crop.ts in.png outPrefix [tileHeight=900] */
import sharp from "sharp";

const [input, prefix, h = "900"] = process.argv.slice(2);
if (!input || !prefix) throw new Error("usage: crop in.png outPrefix [tileHeight]");
const meta = await sharp(input).metadata();
const [W, H, T] = [meta.width!, meta.height!, Number(h)];
let i = 0;
for (let y = 0; y < H; y += T, i++) {
  await sharp(input).extract({ left: 0, top: y, width: W, height: Math.min(T, H - y) }).toFile(`${prefix}-${String(i).padStart(2, "0")}.png`);
}
console.log(`${i} tiles from ${W}x${H}`);
