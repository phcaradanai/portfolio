# แผนยกระดับ NURITRACK 3D (`/logistics`)

วันที่: 2026-10-29

## เป้าหมาย

ทำให้สเตจ 3D ในหน้า `/logistics` มีคุณภาพใกล้เคียงกับ NuriTrack ในวิดีโอ
https://www.youtube.com/watch?v=Lt8XH8HJU_M&t=110s (ช่วง 01:30 Gonjiam Mega Hub)
โดยใช้วิธีทำงานจากวิดีโอ https://www.youtube.com/watch?v=QtvvVMICqqE
(WareTrack: "ข้อมูลมาก่อน 3D เป็นแค่มุมมองของข้อมูล" และ prompt 5 ขั้น)

**สมมติฐานที่ต้องยืนยันก่อนเริ่ม (ดูหัวข้อ "การตัดสินใจที่ค้างอยู่")**
- A1: เปลี่ยนจาก diorama เดียวที่อัด 7 สถานที่ไว้ด้วยกัน เป็นแผนที่ต่อสถานที่ (site) เลือกได้จาก site selector แล้วกล้องบินไปหา
- A2: ยืมเลย์เอาต์และความหนาแน่นของข้อมูลจาก NuriTrack แต่ใช้ฟอนต์และโทนสีจาก `DESIGN.md` ของพอร์ตโฟลิโอ ไม่ลอกหน้าตา SaaS สีขาวของต้นฉบับทั้งหมด

## สิ่งที่เห็นในวิดีโออ้างอิง (เฟรม 01:50)

ภาพนิ่งเก็บไว้ใน scratchpad ของ session เท่านั้น ไม่ commit เข้ารีโป เพราะเป็นงานของผู้อื่น

- **ฉาก:** แผนที่ทั้งไซต์เดียว (Gonjiam Mega Hub) มุมกล้องเฉียงต่ำแบบเกมวางแผน พื้นโทนสว่างนุ่ม (หิมะ) ไม่ใช่นีออนบนพื้นดำ
- **ความหนาแน่น:** รถบรรทุกหัวลาก + ตู้ wing-body หลายสีหลายสิบคัน จอดเรียงตามท่า (dock) และวิ่งตามถนน รั้วรอบไซต์ ต้นไม้สีใบไม้ร่วง ป้ายบิลบอร์ด อาคารคลังที่มีหลังคาและท่าเทียบรถ
- **ป้ายลอย:** pill เล็กเหนือรถแต่ละคัน เช่น `TR-2733 To dock`, `DV-4436 Reversing` และ pill สีส้มสำหรับพัสดุที่กำลังติดตาม
- **HUD:**
  - แถบบน: โลโก้, ช่องค้นหา, ปุ่ม Ops center, site selector (`GJ-01 Gonjiam Mega Hub`), ความเร็ว x1/x2/x4, LIVE + นาฬิกา, ฤดู/สภาพอากาศ, ภาษา EN/KO
  - ซ้ายบน: การ์ด KPI 3 ใบ (Processed today, Vehicles on site, On-time arrival) และรายการโซนของไซต์พร้อมตัวเลข
  - ขวา: แผงตรวจดูพัสดุ (Parcel journey) มีผู้รับ, ที่อยู่, ไซต์ปัจจุบัน, หมายเหตุการส่ง และ timeline 8 ขั้น
  - ขวาล่าง: ตารางเอนทิตีแบบแท็บ (Docks / Trucks / Forklifts / Robots / People) พร้อมสถานะสี
  - ซ้ายล่าง: แท็บสถานการณ์ (Road parcel, Sea import, Air export, ...) และ stepper "Journey of one parcel"
  - ปุ่มควบคุมกล้องแนวตั้ง (ซูม, หมุน, รีเซ็ต) และตัวกรองป้าย Fleet / Infra / All

## สภาพปัจจุบัน

- `LogisticsCanvas.tsx`: กล้อง orthographic zoom 34 `near: -120` พื้นหลังเข้ม มี ContactShadows ไม่ตั้ง tone mapping
- `LogisticsScene.tsx` (404 บรรทัด): ทุกสถานที่อยู่ในฉากเดียวกว้างราว 36 หน่วย ตำแหน่ง hard-code ในไฟล์ ไม่ได้มาจากข้อมูล
- `VehicleEntities.tsx` (437 บรรทัด): รถแต่ละคันเป็น `<mesh>` แยก มีจำนวนน้อย ใช้ instancing แค่ใบไม้ใน `WeatherEcosystem.tsx`
- `LogisticsCameraDirector.tsx`: ลากหมุน yaw/pitch เขียนเอง ไม่มีการ pan และไม่มีขอบเขตแผนที่
- `LogisticsHUD.tsx`: HUD สีเข้มบังฉากเกือบครึ่ง ไม่มีป้ายลอย ไม่มีการคลิกเลือกวัตถุ
- `logistics-store.ts`: เก็บ stage/เวลา/อากาศ/กล้อง แต่ไม่มีโมเดลข้อมูลของ site, dock, รถ, พัสดุ
- สเตจอยู่ในกรอบ `.wall` ของหน้า ไม่ใช่แอปเต็มจอเหมือนต้นฉบับ

## หลักการ (จากวิดีโอ WareTrack)

1. ข้อมูลมาก่อน 3D เป็นแค่มุมมอง คอมโพเนนต์ฉากไม่มี business logic
2. ทุกขั้นต้องมีบรรทัด **Verify** และ commit หลังแต่ละขั้นที่ทำงานได้
3. แก้ทีละอย่าง ถ้าเจอ error ให้วาง error ที่แน่นอนแล้วหาสาเหตุก่อนแก้
4. ไม่เพิ่ม dependency ใหม่ ใช้ `three`, `@react-three/fiber`, `@react-three/drei`, `zustand` ที่ติดตั้งแล้ว
5. อ่านคู่มือใน `node_modules/next/dist/docs/` ก่อนแตะส่วนที่เกี่ยวกับ Next.js (ตาม `AGENTS.md`)

## ขั้นตอน

### ขั้น 0: เตรียมภาพอ้างอิง

- ทำคอนเซปต์ภาพนิ่ง 1 ภาพ (ตาม Step 0 ของ WareTrack) จากเฟรม 01:50 และโทนสีของ `DESIGN.md` แล้วใช้แนบใน prompt ต่อ ๆ ไป
- จดรายการเฟรมอ้างอิงพร้อม timestamp: 00:45, 01:30, 01:50, 02:20, 04:40, 06:25
- **Verify:** มีภาพคอนเซปต์ 1 ภาพที่ผู้ใช้เห็นชอบ

### ขั้น 1: โมเดลข้อมูล (ยังไม่แตะ UI)

- เพิ่มชนิดข้อมูล TypeScript: `Site`, `Zone`, `Dock`, `Vehicle` (truck / forklift / amr / drone), `Parcel`, `ParcelEvent`
- seed data ที่สมจริงใน `src/data/logistics/`: อย่างน้อย 3 ไซต์ (Icheon FC, Gonjiam Mega Hub, Incheon Sub-terminal), ไซต์ละ 6 ถึง 12 dock, รถบรรทุกราว 30 คันต่อไซต์, forklift 8 คัน, พัสดุ 25 ชิ้นพร้อม ETA
- ทุกเอนทิตีมีตำแหน่งในพิกัดของไซต์ ฉากจะวางวัตถุจากข้อมูลนี้เท่านั้น
- ขยาย `logistics-store.ts`: `activeSiteId`, `selectedEntityId`, `labelFilter`, `timeScale`, `tick()` ที่จำลองสถานะรถเปลี่ยนทุก 2 วินาที แบบ deterministic (seeded) เพื่อให้ทดสอบได้
- คง API เดิม (`JOURNEY_STAGES`, `nextStage`, `prevStage`, `setTimeOfDay`, ...) ไว้ให้ `tests/unit/logistics.test.ts` ยังผ่าน หรือแก้เทสต์โดยตั้งใจพร้อมเหตุผล
- **Verify:** `npx vitest run tests/unit/logistics.test.ts` ผ่าน และมีเทสต์ใหม่สำหรับ `tick()` กับตัวคำนวณ KPI

### ขั้น 2: ฉาก 3D จากข้อมูล

ไฟล์: `LogisticsCanvas.tsx`, `LogisticsScene.tsx`, `VehicleEntities.tsx`, `LogisticsCameraDirector.tsx`, `WeatherEcosystem.tsx`

- แยก `LogisticsScene` เป็น `SiteScene` ที่รับ `Site` แล้ววาดพื้น ถนน เส้นจราจร รั้ว อาคาร dock ต้นไม้ จากข้อมูล
- โมเดลรถ low-poly ที่ละเอียดขึ้น: หัวลาก + ตู้ wing-body, หลายสีตามบริษัท, มีล้อ, กระจก, ไฟหน้า
- ใช้ drei `<Instances>` / `<Merged>` สำหรับวัตถุซ้ำ: รถ ตู้ รั้ว ต้นไม้ เสาไฟ เพื่อให้ draw call ต่ำ
- กล้อง: ใช้ drei `MapControls` หรือ `CameraControls` แทนการลากหมุนที่เขียนเอง มี pan ด้วยเมาส์, ซูมด้วยล้อ, จำกัดขอบเขตไม่ให้หลุดแผนที่, มุมเฉียงแบบเกมวางแผน
- เปลี่ยนไซต์แล้วกล้องเคลื่อนนุ่มไปยังไซต์ใหม่ (CameraControls `setLookAt` แบบ transition)
- แสง: กลางวันเป็นโทนสว่างนุ่ม overcast, กลางคืนเป็นกรมท่าพร้อมเส้นถนนเรืองแสงอ่อน ๆ, ตั้ง `toneMapping` เป็น ACESFilmic และ `outputColorSpace` ให้ถูก, ลดไฟนีออนที่ล้นในโหมดกลางคืน
- แก้ `near: -120` ของกล้อง orthographic (หรือเปลี่ยนเป็น perspective FOV แคบถ้าต้องการความลึกแบบต้นฉบับ)
- **Verify:** ไซต์ Gonjiam แสดงรถ 30 คันขึ้นไป, pan/zoom ทำงานและไม่หลุดขอบ, draw call (ดูจาก `gl.info.render.calls`) ต่ำกว่า 150

### ขั้น 3: คลิกเพื่อตรวจดู

ไฟล์: `VehicleEntities.tsx`, คอมโพเนนต์ใหม่ `EntityLabel.tsx`, `EntityInspector.tsx`

- ป้ายลอยด้วย drei `<Html>`: pill รหัสรถ + สถานะ, pill สีส้มสำหรับพัสดุที่กำลังติดตาม, กรองได้ Fleet / Infra / All
- คลิกวัตถุแล้วไฮไลต์ด้วย drei `<Outlines>` (ไม่ต้องเพิ่ม postprocessing) และเปิดแผงตรวจดูด้านขวา: ชื่อ, สถานะ, งานปัจจุบัน, เวลาอัปเดตล่าสุด
- แผงอ่านจาก store และอัปเดตตาม `tick()` โดยฉากไม่ re-render ทั้งก้อน
- ป้ายต้องอ่านได้ด้วยคีย์บอร์ดและ screen reader ในระดับที่เหมาะสม (ปุ่มใน HUD เป็นทางหลัก)
- **Verify:** คลิกรถแล้วเห็น outline และแผงตรวจดู, ค่าในแผงเปลี่ยนทุก 2 วินาที, FPS ไม่ตกเมื่อเปิดป้ายทั้งหมด

### ขั้น 4: HUD, KPI, ไซต์ และตัวกรอง

ไฟล์: `LogisticsHUD.tsx` (แยกเป็นคอมโพเนนต์ย่อย), `src/styles/experience.css`

- แถบบน: site selector, ความเร็ว x1/x2/x4, LIVE + นาฬิกาจำลอง, เวลา/สภาพอากาศ
- การ์ด KPI คำนวณจาก store: Processed today, Vehicles on site, On-time arrival, Docks in use
- รายการโซนของไซต์พร้อมตัวเลข
- stepper "Journey of one parcel" (แทนแถบ stage เดิมด้านล่าง)
- ตารางเอนทิตีแบบแท็บ Docks / Trucks / Forklifts / Robots และตัวกรอง "เฉพาะที่ล่าช้า" กับ "ตามสถานะ"
- แผงทั้งหมดต้องไม่บังฉากเกินจำเป็น พับเก็บได้ และใช้ฟอนต์/สีจาก `DESIGN.md`
- เพิ่มปุ่มเต็มจอ (Fullscreen API) หรือเพิ่มความสูงสเตจ เพราะต้นฉบับเป็นแอปเต็มจอ
- มือถือ: แผงย่อเป็น bottom sheet, ลดจำนวนรถ, ปิดเงา
- **Verify:** สลับไซต์แล้วกล้องเคลื่อนและ KPI เปลี่ยน, ตัวกรองซ่อนแถวและรถได้จริง, หน้าใช้ได้ที่ความกว้าง 375px

### ขั้น 5: รีวิวและขัดเกลา

- รีวิวเหมือน senior engineer: บั๊ก, ปัญหาประสิทธิภาพ, โค้ดที่ไม่ใช้ (เช่น คอมโพเนนต์เดิมที่ถูกแทน)
- ตรวจ 60 FPS บนเดสก์ท็อป, draw call, หน่วยความจำ geometry/texture ไม่รั่วเมื่อสลับไซต์
- เคารพ `prefers-reduced-motion`: หยุดการจำลองอัตโนมัติและการบินของกล้อง
- ปรับข้อความในหน้า `src/app/logistics/page.tsx` ให้ตรงกับสิ่งที่ทำได้จริง ไม่อ้างเกิน
- รัน `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`
- Playwright จับภาพสเตจ 1 ภาพเทียบกับภาพคอนเซปต์
- **Verify:** ทุกคำสั่งข้างบนผ่าน และแนบผลไว้ในรายงาน

## ความเสี่ยง

- ขนาด bundle ของหน้า `/logistics` จะโตขึ้น: ยังคงโหลดผ่าน `next/dynamic` แบบ `ssr: false` ตาม D13 ใน `docs/design/DECISIONS.md`
- drei `<Html>` จำนวนมากทำให้ DOM หนัก: แสดงป้ายเฉพาะวัตถุในระยะหรือตามตัวกรอง
- โมเดลรถที่ละเอียดขึ้นกับจำนวนมาก: ต้องใช้ instancing ตั้งแต่แรก ไม่ใช่มาแก้ทีหลัง
- ชื่อและข้อมูลทั้งหมดเป็นข้อมูลสมมติ ไม่ใช้โลโก้หรือแบรนด์จริงจากวิดีโอ

## การตัดสินใจ

1. **โครงฉาก (ตัดสินแล้ว 2026-10-29):** แผนที่ต่อไซต์ + site selector เหมือนต้นฉบับ
2. **หน้าตา HUD (ตัดสินแล้ว 2026-10-29):** ใช้เลย์เอาต์ NuriTrack แต่ฟอนต์/สีของพอร์ตโฟลิโอ

## ความคืบหน้า

- ขั้น 0: ข้ามภาพคอนเซปต์ไปก่อน ใช้เฟรม 01:50 เป็นภาพอ้างอิงแทน
- ขั้น 1 (เสร็จ): `src/data/logistics/types.ts`, `seed.ts` (3 ไซต์), `sim.ts` (`createInitialWorld`, `stepSim`, `computeSiteKpis`, `computeZoneCounts`, RNG แบบ seed), store มี `world`, `activeSiteId`, `selectedEntityId`, `labelFilter`, `tick()` และเทสต์ใน `tests/unit/logistics-sim.test.ts`
  - ข้อมูลโลกจำลองอยู่ในพิกัดของไซต์ ตำแหน่งรถที่จอด dock หรือรอในลานให้ฉากคำนวณจาก `dockId` และโซน `yard`
- ขั้น 2 (เสร็จ): `SiteScene.tsx` แทน `LogisticsScene.tsx` ในแคนวาส
  - `SiteWorld.tsx`: พื้น ถนน ทางหลวงร่วม อาคาร ประตู dock รั้ว ต้นไม้ เสาไฟ บิลบอร์ด วางจาก `SITES` ทั้งหมด
  - `Fleet.tsx`: รถบรรทุก, forklift และ trailer จอด ผ่าน drei `<Merged>` รถวิ่งตามเส้นทางจาก `src/data/logistics/routes.ts` (ถอยเข้า dock, ถอยออกจากลาน)
  - `SiteCameraRig.tsx`: drei `CameraControls` กล้อง perspective, ลากเพื่อ pan, ล้อเพื่อซูม (มี `data-lenis-prevent`), นิ้วเดียวเลื่อนหน้า สองนิ้ว pan/zoom, กรอบจำกัดต่อไซต์, บินไปยังไซต์ที่เลือก
  - `palette.ts`: กลางวัน/พลบค่ำ/กลางคืน, ค่าเริ่มต้นเป็นกลางวัน + หิมะ, แสงเงาตามไซต์ที่เลือก
  - HUD: แถว CCTV CAM เปลี่ยนเป็นตัวเลือกไซต์ `SimClock` เรียก `tick()` ทุก 2 วินาที
  - วัดได้ 96–97 draw call ต่อเฟรม (เป้า < 150)
  - ยังค้าง: ไม่วาด AMR (อยู่ใต้หลังคา), รถวิ่งทะลุกันได้, stepper journey ด้านล่างไม่ขยับกล้องแล้ว (ขั้น 4), ไฟล์ฉากเก่า (`LogisticsScene`, `VehicleEntities`, `LogisticsCameraDirector`, `WarehouseConveyorAndScanner`, `MegaHubDivertChutes`, `HighwayGantrySign`, `LogisticsRouteArc`) ไม่ถูกใช้แล้ว รอผู้ใช้อนุมัติก่อนลบ
- ขั้น 3 (เสร็จ): ป้ายลอยและคลิกเพื่อตรวจดู
  - ป้ายเป็นชั้น DOM เดียว (`SceneLabels.tsx`) ที่ `LabelProjector.tsx` ย้ายตำแหน่งทุกเฟรมจากพิกัดใน `labelAnchors.ts` แทน drei `<Html>` เพราะ `<Html>` สร้าง React root ต่อป้ายและ React 19 แจ้ง error ตอน unmount
  - ตัวกรอง Fleet / Infra / All ใน HUD, ป้าย dock และอาคาร, ป้ายรถมีสีตามสถานะ (late เป็นสีแดง thread)
  - คลิกรถใน 3D หรือคลิกป้ายเพื่อเลือก ไฮไลต์ด้วยวงแหวนสีอำพันและกล่อง `<Edges>` แทน drei `<Outlines>` เพราะรถเป็น instance ไม่ใช่ mesh
  - `EntityInspector.tsx`: การ์ดกระดาษแบบ wall label สำหรับรถ, dock, อาคาร ปิดด้วยปุ่มหรือ Esc ระหว่างเปิดจะซ่อน AI log
- ขั้น 4 (เสร็จ): `SiteHUD.tsx` แทน `LogisticsHUD.tsx` (ไฟล์เก่าไม่ถูกใช้แล้ว)
  - แถบบน: ตัวเลือกไซต์, LIVE + นาฬิกาจำลอง, Pause/×1/×2/×4, เวลา/อากาศ/ป้าย, เต็มจอ
  - การ์ดซ้าย: KPI 4 ตัวจาก `computeSiteKpis`, แจ้งเตือนรถรอเกิน 5 นาที, รายการโซน, การ์ด "Journey of one parcel" 8 ขั้นพร้อมเวลา เลื่อนดูพัสดุได้
  - การ์ดขวา: inspector, ตาราง Trucks/Docks/Forklifts/Robots (ใช้ `Tabs` ของบ้าน), ตัวกรอง Delayed only + สถานะ ซ่อนทั้งแถวและรถในฉาก, "Code decides · rule log" ที่สร้างจากการตัดสินใจจริงของตัวจำลอง (`decisionLog`)
  - ทุกคอมโพเนนต์ใช้ selector ของ store ไม่ re-render ทั้ง HUD
  - มือถือ: การ์ด KPI เป็น sheet ล่าง, ซ่อนตัวควบคุมมุมมอง/โซน/พัสดุ/ตาราง, แสดงเฉพาะป้ายที่เลือก, ปิดเงาและจำกัด dpr บนอุปกรณ์สัมผัส, กล้องถอยตามสัดส่วนจอ
  - ยังไม่ได้ทดสอบ: ปุ่มเต็มจอ (ต้องมีการกดจริงจากผู้ใช้), การสัมผัสบนเครื่องจริง
  - ค้างไว้ทำขั้น 5: forklift ที่ idle/charging วิ่งตรงไปที่จอดหน้าออฟฟิศ อาจทะลุอาคาร; ช่องในลานผูกกับลำดับคิว พอคันหน้าออก คันที่เหลือจะถอยออกแล้วจอดใหม่; รถโผล่/หายห่างจากประตู 45 ม. เห็นได้ตอนซูมออกสุด; ยังไม่ได้วัด FPS จริง (ตัวเลข 60 FPS ใน HUD เป็นค่าคงที่เก่า); ยังไม่ได้ทดสอบ touch บนมือถือจริง
