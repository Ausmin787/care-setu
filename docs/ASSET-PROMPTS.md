# Asset prompts — images Sasanka generates

Prompts for images the design needs and nobody has photographed. Sasanka generates them (ChatGPT image or Gemini),
Claude picks and places them. **Before any image ships:** a `docs/CLAIMS.md` row (tool, date, file name, "illustration,
not our stock / staff / premises"), and alt text that says what it shows. Never people as staff or patients (INVARIANT 16).

## Equipment still-lifes (Home reel, D-030) — 6 images, portrait 4:5, 1600×2000
**Delivered 2026-09-28** (1122×1402, ChatGPT image), registered as C-073, live in `public/illustrations/equipment/`.

**Shared style (paste first, every time):**
> Editorial still-life photograph, portrait 4:5. A single piece of home medical equipment in a calm, lived-in Indian
> home, soft late-afternoon window light from the left, warm parchment and sand tones (walls #F3ECE1, fabrics #D8C7AE),
> deep warm shadows, shallow depth of field, 50mm lens, quiet and dignified, lots of empty wall above the object.
> No people, no hands, no text, no logos or brand names on the equipment, no hospital room, no clutter.

**Subjects (one per image, add after the shared style):**
1. A white oxygen concentrator on the floor beside an armchair with a folded cotton shawl; a thin clear tube coiled on the seat.
2. A motorised home-care bed made up with plain cream linen, side rails down, next to a window with sheer curtains.
3. A folded-open reclining wheelchair with a high backrest, parked by a doorway onto a sunlit verandah.
4. A compact patient monitor on a wooden bedside table, screen dark, next to a steel water tumbler and reading glasses.
5. A CPAP machine with its mask resting on a bedside shelf, a small brass lamp beside it.
6. A patient hoist with its sling, standing beside a bed with a patterned Indian cotton bedcover.

**Attach for consistency:** the hero video's first frame (palette), then the first good result for images 2–6.
**Delivery:** drop the files in `refs/care-setu/stills/` with the subject number in the name; Claude crops to the slot.

## Service still-lifes (Services deck, D-031): 7 images, portrait 4:5, 1600×2000
**Delivered 2026-10-02**, registered as C-087, live in `public/illustrations/services/`.
Same shared style as above (paste it first), and **attach two of the equipment still-lifes** (the motorised bed and the
patient monitor work best) so the light, palette and lens match. The deck crops them to a near-square slot beside
the text and to a wide strip on phones, so **keep the object in the middle third** with room on every side.
**Subjects (one per image, after the shared style):**
1. *Nurse at Home:* a nurse's vitals kit on a wooden bedside table: a folded blood-pressure cuff, a digital thermometer, a small bottle of hand sanitiser and a folded white hand towel, beside a neatly made bed.
2. *GDA at Home:* an armchair by a sunlit window with a folded cotton towel on its arm, a wooden walking stick resting against it, and a steel tumbler and a covered steel plate on a small side table.
3. *Nursing procedures:* a dressing tray on a clean white cloth on a wooden table: sealed gauze packs, a rolled bandage, surgical tape and a pair of steel scissors, neatly laid out.
4. *ICU care at home:* a quiet bedroom set up for critical care: a ventilator on a wheeled stand and a patient monitor beside a motorised bed, screens dark, sheer curtains, calm late light.
5. *Doctor at Home:* a stethoscope and a closed brown leather doctor's bag on a dining table beside a steel glass of water, with a folded cotton napkin.
6. *Physiotherapy:* resistance bands and a pair of small dumbbells on a cotton durrie, beside a wooden chair, with a rolled exercise mat against the wall.
7. *Lab sample collection:* a sample collection kit on a side table: sealed blood tubes standing in a small rack, cotton swabs, a tourniquet strip and a closed insulated box.
**No text or brand names anywhere** (tubes and bags unlabelled), no people or hands. **Delivery:** as above, with
the subject number and the word "service" in the file name. Each gets a CLAIMS row before it ships (as C-073).

## About still-lifes (D-032): 7 images
**Delivered 2026-10-02**, registered as C-086. Values 1–4 are live in `public/illustrations/about/`; capsules 5–7 were tried and dropped (the vision capsules keep their icons, D-039), originals only in `refs/care-setu/stills/`.
Same shared style as the equipment still-lifes (paste it first) and **attach two of them** (the motorised bed and the
patient monitor) so the light, palette and lens match. No people, no hands, no text or brand names.
**Values (4), portrait 4:5, 1600×2000.** The card is 4:5 and small on laptops, so keep the object large and centred.
1. *Care:* a hand-knitted cotton shawl folded over the arm of a wooden armchair by a sunlit window, a steel tumbler of water on the side table.
2. *Trust:* a front door left slightly open onto a bright, tidy hallway, a pair of house slippers set neatly just inside.
3. *Healing:* a physiotherapy resistance band and a small pair of dumbbells on a cotton durrie beside a window, morning light across the floor.
4. *Home:* a made bed with a patterned Indian cotton bedcover, a folded reading glasses case and a small brass lamp on the bedside table.
**Capsules (3), wide 2.4:1, 2400×1000.** They show inside a pill about three words long, so one simple object, centred,
with plain wall around it.
5. *Recovery continues at home:* a single potted tulsi plant on a sunlit windowsill.
6. *Care continues with the family:* two steel tea glasses and a small plate of biscuits on a low wooden table.
7. *Support continues with the patient:* a wooden walking stick leaning against a cream wall beside a chair.
**Delivery:** `refs/care-setu/stills/` with the number and "about" in the file name; each gets a CLAIMS row (as C-073).

## Dr Saurabh Chauhan's founder portrait (D-051, C-100): one image, portrait 3:4, 1536×2048
**Rules first.** Attach his photo and use ChatGPT's *edit this image* route, never "generate a person like this". Make 3 or 4 variants and keep the one that looks most like him. Do not upscale or
"enhance" afterwards. Nothing goes into the repo until C-100 is approved (he has seen it, agrees it is him, consents to web use and to the AI edit). Send me the pick for review.

**Prompt (paste with the photo attached):**

> Edit the attached photo of this man into a professional head-and-shoulders corporate portrait. This is the same real person: keep his face exactly as it is. Preserve his facial structure, face shape, eyes and eye shape, eyebrows, nose, lips, jawline, ears, skin tone and natural skin texture (pores, faint lines, no smoothing or beauty filter), his full black moustache, his short stubble beard exactly as it grows, and his thick, dark, voluminous short hairstyle with its natural parting and volume. Do not make him look younger, slimmer, lighter-skinned or more symmetrical, and do not change his age. If anything is unclear, stay closer to the original.
>
> Remove everything behind him and the weather on him: no temple, no crowd, no strangers, no sky, no snow or water drops in his hair or on his face or clothes. Replace the background with a plain, seamless, very light warm-grey studio backdrop (close to #EFEDEA), evenly lit, with only a very faint soft falloff and no texture, no vignette, no gradient glow, no props.
>
> Clothing: a well-fitted dark navy blazer over a crisp white shirt with an open collar and no tie, like a founder's profile photo. Hide any chain or jewellery inside the collar. No white coat, no stethoscope, no badge, no logo, no text on the clothes.
>
> Expression and pose: relaxed, calm, confident and approachable, looking straight into the camera at eye level, eyebrows level and not furrowed, eyes fully open and not squinting, lips closed with the faintest natural smile. Shoulders square to the camera or turned very slightly, head upright. Correct the wide-angle selfie distortion so the nose and face proportions look natural, as if shot on an 85 mm lens.
>
> Framing: vertical 3:4, head and shoulders down to mid-chest, his head filling about 45 to 50 percent of the frame height, a little headroom above the hair, centred. Soft, large, even studio key light from the front-left at a slight angle with gentle fill on the shadow side, natural catchlights in the eyes, accurate colour, realistic camera detail and a natural level of sharpness. It must look like a real photograph, not an illustration, a render or a painting.
>
> No text, no watermark, no logo, no border, no extra people, no hands in frame, no glasses, no hat.

**If the first result is close but not right**, reply in the same chat with one fix at a time, and finish each with "keep everything else exactly the same":
- *Face drifted:* "This no longer looks like him. Go back to the attached original and keep his exact face; change only the background, clothing and lighting."
- *Too smooth or plastic:* "Restore natural skin texture and fine detail. No smoothing."
- *Stubble or moustache changed:* "Match the moustache and stubble pattern of the original photo exactly."
- *Hair changed:* "Match the hairstyle and hair volume of the original photo exactly."
- *Background not plain:* "Make the background a flat, seamless, very light warm-grey with no gradient."

**Match to the other founders (checked against `refs/care-setu/founders/`):** 3:4 portrait, head and shoulders, dark navy or black blazer, white shirt, light neutral background, soft even light, direct calm gaze. The About card then applies one warm monochrome treatment to all four, so small differences in colour grade disappear; the face and framing are what must match.

**Delivery:** save the pick as `refs/care-setu/founders/saurabh-chatgpt.png` (gitignored). Do not put it in `public/`.
