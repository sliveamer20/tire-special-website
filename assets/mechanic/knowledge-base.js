/* ===== Ask a Mechanic — Knowledge Base (pure data, no logic) =====
 *
 * Two layers:
 *
 * 1. window.MechanicSymptomGroups — the matching vocabulary. Each group is a
 *    concept a user might describe in many different ways ("keywords" are the
 *    canonical phrasings, "synonyms" are looser/slang alternatives). The
 *    diagnosis engine matches user input against this list; it never contains
 *    any domain logic itself.
 *
 * 2. window.MechanicKB — the diagnosis rules ("scenarios"). Each scenario
 *    references one or more symptom groups by id with a weight. A scenario
 *    tied to several groups that all match in the same user description will
 *    score higher than one tied to only a single matched group — that's the
 *    mechanism that combines multiple reported symptoms into one ranked
 *    diagnosis instead of a flat keyword hit list.
 *
 * Phase 2: reorganized into 13 categories covering the most common
 * automotive problems — Tires, Wheels, Brakes, Steering, Suspension, Engine,
 * Cooling System, Battery & Electrical, Starting System, Transmission, Air
 * Conditioning, Exhaust, and Dashboard Warning Lights. Categories reflect how
 * a customer would describe the problem, not always where the root cause
 * lives (e.g. "car won't start" scenarios live under Starting System even
 * though the fix is often the battery, because that's the symptom the
 * clarifying questions triage from).
 *
 * Because matching is plain substring/word-boundary text matching (see
 * diagnosis-engine.js), each group lists several full natural phrasings, not
 * just a root word — e.g. "engine overheating" AND "engine is overheating"
 * are both listed, because the engine does no stemming/fuzzy matching and a
 * single inserted word ("is") breaks a substring match.
 *
 * To expand later: add a new symptom group, add a new scenario, add keywords/
 * synonyms to an existing group, or re-weight an existing scenario. This file
 * is pure data — assets/mechanic/diagnosis-engine.js never needs to change.
 */
(function () {
  var SYMPTOM_GROUPS = [
    // ---- Tires ----
    { id: 'tire_losing_air', label: 'Tire Losing Air', keywords: ['tire keeps losing air', 'tire loses air', 'tire is losing air', 'tire going flat', 'tire keeps going flat', 'losing tire pressure', 'slow leak', 'slow leak in the tire'], synonyms: ['deflating tire'] },
    { id: 'tire_noise', label: 'Tire Noise', keywords: ['tire noise', 'humming from tires', 'tire humming', 'roaring noise from wheels', 'noise from the tires'], synonyms: ['whining tires', 'buzzing tires'] },
    { id: 'tire_tread_wear', label: 'Uneven Tire Wear', keywords: ['uneven tread wear', 'tire wearing unevenly', 'wearing on one side', 'bald spots on tire', 'wearing down unevenly'], synonyms: ['cupped tires', 'feathered tread'] },
    { id: 'tire_sidewall_bulge', label: 'Tire Sidewall Bulge', keywords: ['bulge on tire', 'bulge on my tire', 'bubble on tire', 'bubble on my tire', 'sidewall bulge', 'tire bubble'], synonyms: ['sidewall bump'] },
    { id: 'tpms_light', label: 'Tire Pressure Warning Light', keywords: ['tire pressure light', 'tpms light', 'low tire pressure warning', 'tire pressure warning light'], synonyms: ['tire warning light'] },
    { id: 'tire_blowout', label: 'Tire Blowout / Flat', keywords: ['tire blew out', 'flat tire', 'tire burst', 'sudden flat'], synonyms: ['blowout'] },
    { id: 'tire_dry_rot', label: 'Cracked / Dry-Rotted Tire', keywords: ['cracks in the tire sidewall', 'tire sidewall cracking', 'dry rot on tire', 'cracked tire sidewall'], synonyms: ['weathered tire', 'tire dry rot'] },
    { id: 'tire_low_tread', label: 'Low Tire Tread', keywords: ['tires are bald', 'low tread depth', 'worn out tires', 'tires are worn smooth'], synonyms: ['bald tires'] },

    // ---- Wheels ----
    { id: 'vibration_highway', label: 'Vibration at Highway Speed', keywords: ['vibration at highway speed', 'vibrates at highway speed', 'shakes at highway speed', 'vibration at speed', 'shaking at speed', 'vibration in the steering wheel at speed'], synonyms: ['shimmy', 'wobble', 'judder', 'vibration in the seat', 'vibration in the floor'] },
    { id: 'steering_wheel_shake', label: 'Steering Wheel Shakes', keywords: ['steering wheel shakes', 'steering wheel vibrates', 'wheel shakes', 'shaking steering wheel'], synonyms: ['wobbly steering'] },
    { id: 'wheel_bearing_noise', label: 'Wheel Bearing Noise', keywords: ['wheel bearing noise', 'humming that gets louder with speed', 'growling noise from the wheel', 'noise that changes when turning'], synonyms: ['roaring wheel noise'] },
    { id: 'wheel_bent_rim', label: 'Bent or Damaged Rim', keywords: ['bent rim', 'damaged rim', 'dented wheel', 'cracked wheel rim'], synonyms: ['wheel damage'] },
    { id: 'wheel_loose', label: 'Loose Wheel', keywords: ['wheel feels loose', 'wobbling wheel', 'wheel wobble', 'loose lug nuts'], synonyms: ['wobbly wheel'] },
    { id: 'wheel_curb_damage', label: 'Curb Damage to Wheel', keywords: ['scraped my rim', 'curb rash', 'hit the curb'], synonyms: ['curb damage'] },

    // ---- Brakes ----
    { id: 'brake_squeal', label: 'Brake Squeal', keywords: ['brakes squeal', 'brakes are squeaking', 'squealing brakes', 'squeaking brakes', 'squeaky brakes'], synonyms: ['screeching brakes'] },
    { id: 'brake_grind', label: 'Brake Grinding', keywords: ['brakes grinding', 'brakes are grinding', 'grinding noise when braking', 'metal on metal brakes'], synonyms: ['grinding brakes'] },
    { id: 'brake_noise_general', label: 'Brake Noise', keywords: ['brake noise', 'noise from brakes', 'brakes making noise', 'noise when braking'], synonyms: [] },
    { id: 'brake_soft_pedal', label: 'Soft Brake Pedal', keywords: ['brake pedal feels soft', 'spongy brake pedal', 'brake pedal sinks', 'brake pedal goes to the floor'], synonyms: ['mushy brakes'] },
    { id: 'brake_hard_pedal', label: 'Hard/Stiff Brake Pedal', keywords: ['brake pedal is hard', 'stiff brake pedal', 'brake pedal is hard to press', 'hard to push the brake pedal'], synonyms: ['stiff brakes'] },
    { id: 'brake_shake', label: 'Shaking When Braking', keywords: ['car shakes when braking', 'shaking when i brake', 'vibration when braking', 'pulsing brake pedal'], synonyms: ['brake pulsation'] },
    { id: 'parking_brake_stuck', label: 'Parking Brake Stuck', keywords: ['parking brake wont release', 'parking brake is stuck', 'emergency brake stuck'], synonyms: ['e brake stuck'] },
    { id: 'brake_fluid_leak', label: 'Brake Fluid Leak', keywords: ['brake fluid leak', 'fluid leaking near the wheel', 'leaking brake fluid'], synonyms: ['puddle under the car near the wheel'] },
    { id: 'car_pulls_side', label: 'Car Pulls to One Side', keywords: ['pulls to one side', 'car pulls', 'pulling to the left', 'pulling to the right', 'drifts to one side'], synonyms: ['veers left', 'veers right'] },

    // ---- Steering ----
    { id: 'hard_steering', label: 'Hard/Heavy Steering', keywords: ['hard to steer', 'steering feels heavy', 'difficult to turn the wheel', 'stiff steering'], synonyms: ['heavy steering'] },
    { id: 'steering_off_center', label: 'Steering Wheel Off-Center', keywords: ['steering wheel off center', 'steering wheel crooked', 'wheel not straight'], synonyms: ['crooked steering wheel'] },
    { id: 'steering_noise_turning', label: 'Noise When Turning the Wheel', keywords: ['whining noise when turning', 'noise when turning the wheel', 'squeal when turning'], synonyms: ['whining steering'] },
    { id: 'steering_play_loose', label: 'Loose / Play in Steering', keywords: ['steering wheel feels loose', 'play in the steering wheel', 'steering wheel has slack'], synonyms: ['loose steering'] },
    { id: 'car_wanders', label: 'Car Wanders at Speed', keywords: ['car wanders at speed', 'car feels unstable at speed', 'hard to keep the car straight'], synonyms: ['wandering steering'] },

    // ---- Suspension ----
    { id: 'suspension_clunk', label: 'Clunking Over Bumps', keywords: ['clunking noise over bumps', 'clunk over bumps', 'knocking over bumps'], synonyms: ['rattling over bumps', 'hitting a pothole', 'after hitting a pothole'] },
    { id: 'suspension_bouncy', label: 'Bouncy Ride', keywords: ['car bounces a lot', 'bouncy ride', 'keeps bouncing after a bump'], synonyms: ['bouncy suspension'] },
    { id: 'suspension_sags', label: 'Suspension Sagging', keywords: ['car sits lower on one side', 'car sags on one corner', 'one corner of the car is lower'], synonyms: ['sagging suspension'] },
    { id: 'suspension_nose_dive', label: 'Nose Dives When Braking', keywords: ['front dips when braking', 'nose dives when i brake', 'car dips forward when braking'], synonyms: ['brake dive'] },
    { id: 'cv_joint_click', label: 'Clicking When Turning', keywords: ['clicking noise when turning', 'clicking sound in turns', 'popping noise when turning'], synonyms: ['cv joint noise'] },

    // ---- Engine ----
    { id: 'engine_rough_idle', label: 'Rough Idle / Stalling', keywords: ['rough idle', 'car stalls', 'engine stalling', 'shaking at idle', 'sputtering engine', 'engine misfires', 'car jerks when accelerating'], synonyms: ['stalls at stop'] },
    { id: 'engine_knock', label: 'Engine Knocking', keywords: ['knocking noise from engine', 'engine knocking', 'tapping noise from engine'], synonyms: ['pinging engine', 'ticking engine'] },
    { id: 'oil_leak', label: 'Oil Leak', keywords: ['oil leak', 'oil spot under the car', 'leaking oil', 'burning oil smell', 'smell burning oil', 'smell of burning oil'], synonyms: ['dripping oil'] },
    { id: 'engine_loss_of_power', label: 'Loss of Engine Power', keywords: ['engine lacks power', 'no power when accelerating', 'car feels sluggish', 'loss of power'], synonyms: ['weak acceleration'] },

    // ---- Cooling System ----
    { id: 'overheating', label: 'Engine Overheating', keywords: ['engine overheating', 'engine is overheating', 'temperature gauge is high', 'temperature gauge is in the red', 'car is overheating', 'steam from hood', 'steam coming from the hood'], synonyms: ['running hot', 'overheated engine'] },
    { id: 'coolant_leak', label: 'Coolant Leak', keywords: ['coolant leak', 'green fluid under the car', 'losing coolant', 'antifreeze leak'], synonyms: ['leaking coolant'] },
    { id: 'no_heat', label: 'No Heat From Vents', keywords: ['no heat from the vents', 'heater not working', 'heater blowing cold air'], synonyms: ['heater broken'] },
    { id: 'overheat_in_traffic', label: 'Overheats at Idle / in Traffic', keywords: ['overheats in traffic', 'overheats at idle', 'cooling fan not running'], synonyms: ['fan not turning on'] },

    // ---- Battery & Electrical ----
    { id: 'battery_dead', label: 'Dead Battery', keywords: ['battery is dead', 'the battery died', 'battery has died'], synonyms: ['dead battery'] },
    { id: 'battery_keeps_dying', label: 'Battery Keeps Dying', keywords: ['battery keeps dying', 'battery dies overnight', 'battery dies repeatedly', 'need to jump start it often'], synonyms: ['battery drains overnight'] },
    { id: 'lights_dim_while_driving', label: 'Lights Dim / Flicker While Driving', keywords: ['lights dim while driving', 'dashboard lights flicker', 'electronics acting up while driving'], synonyms: ['flickering lights'] },
    { id: 'accessory_electrical_failure', label: 'Electrical Accessory Failure', keywords: ['power windows dont work', 'power locks not working', 'radio stopped working', 'blown fuse'], synonyms: ['electrical accessory failure'] },
    { id: 'corroded_terminals', label: 'Corroded Battery Terminals', keywords: ['corrosion on the battery', 'corroded battery terminals', 'white powder on the battery'], synonyms: ['battery corrosion'] },

    // ---- Starting System ----
    { id: 'engine_wont_start', label: "Engine Won't Start", keywords: ['car wont start', "car won't start", 'engine wont start', 'vehicle wont start'], synonyms: ["won't turn over"] },
    { id: 'no_crank_no_sound', label: 'No Response When Starting', keywords: ['nothing happens when i turn the key', 'car is completely dead', 'no response when starting', 'wont do anything when i try to start it'], synonyms: ['completely dead when starting'] },
    { id: 'starting_click', label: 'Clicking When Starting', keywords: ['clicking when starting', 'rapid clicking noise when i turn the key', 'clicking sound no start'], synonyms: ['clicking starter'] },
    { id: 'cranks_no_start', label: 'Cranks But Won’t Start', keywords: ['engine cranks but wont start', 'cranks but doesnt start', 'turns over but wont start'], synonyms: ["won't catch"] },
    { id: 'slow_crank', label: 'Slow / Sluggish Crank', keywords: ['engine cranks slowly', 'slow to start', 'sluggish start'], synonyms: ['cranks slowly'] },
    { id: 'intermittent_starting', label: 'Intermittent Starting Problem', keywords: ['sometimes it wont start', 'hard to start when hot', 'hard to start when cold', 'starts sometimes not others'], synonyms: ['intermittent starting problem'] },

    // ---- Transmission ----
    { id: 'trans_slipping', label: 'Transmission Slipping', keywords: ['transmission slipping', 'engine revs but car doesnt accelerate', 'rpm goes up but no acceleration'], synonyms: ['transmission slips'] },
    { id: 'trans_rough_shifting', label: 'Rough / Hard Shifting', keywords: ['rough shifting', 'hard shifting', 'transmission shifts hard', 'clunks when shifting gears'], synonyms: ['harsh shifting'] },
    { id: 'trans_fluid_leak', label: 'Transmission Fluid Leak', keywords: ['transmission fluid leak', 'red fluid under the car', 'leaking transmission fluid'], synonyms: ['leaking trans fluid'] },
    { id: 'trans_wont_engage', label: "Won't Go Into Gear", keywords: ['wont go into gear', 'car wont move in drive', 'stuck in neutral'], synonyms: ['transmission not engaging'] },
    { id: 'trans_whine_noise', label: 'Transmission Whine', keywords: ['whining noise from the transmission', 'humming noise that changes with gear'], synonyms: ['transmission whine'] },
    { id: 'clutch_slipping', label: 'Clutch Slipping', keywords: ['clutch is slipping', 'clutch pedal feels different', 'burning smell from the clutch'], synonyms: ['slipping clutch'] },

    // ---- Air Conditioning ----
    { id: 'ac_not_cold', label: 'AC Not Cold', keywords: ['ac not cold', 'ac isnt cold', 'ac isn t cold', 'ac is not cold', 'air conditioning not working', 'ac blowing warm air', 'air conditioner not cold', 'air conditioning not cold'], synonyms: ['air conditioner broken'] },
    { id: 'ac_weak_airflow', label: 'Weak AC Airflow', keywords: ['ac airflow is weak', 'weak air from the vents', 'barely any air from the vents'], synonyms: ['weak ac airflow'] },
    { id: 'ac_bad_smell', label: 'AC Smells Bad', keywords: ['ac smells bad', 'musty smell from the vents', 'moldy smell from the ac'], synonyms: ['ac smells musty'] },
    { id: 'ac_cycling_noisy', label: 'AC Cycling / Noisy', keywords: ['ac makes a loud noise', 'ac compressor cycling on and off', 'loud noise when the ac is on'], synonyms: ['noisy ac compressor'] },
    { id: 'ac_intermittent', label: 'AC Cools Intermittently', keywords: ['ac cools sometimes but not always', 'ac only cold sometimes', 'ac stops cooling at idle'], synonyms: ['intermittent ac cooling'] },

    // ---- Exhaust ----
    { id: 'exhaust_noise', label: 'Exhaust Noise', keywords: ['exhaust rattle', 'loud exhaust', 'rattling under the car'], synonyms: ['muffler noise'] },
    { id: 'exhaust_smoke', label: 'Exhaust Smoke', keywords: ['smoke from exhaust', 'blue smoke', 'white smoke', 'black smoke from exhaust'], synonyms: ['smoking exhaust'] },
    { id: 'exhaust_loud', label: 'Sudden Loud Exhaust', keywords: ['exhaust got really loud', 'car is much louder than usual', 'loud roaring exhaust noise'], synonyms: ['loud exhaust noise'] },
    { id: 'exhaust_fumes_smell', label: 'Exhaust Fumes in Cabin', keywords: ['smell exhaust fumes inside the car', 'exhaust smell in the cabin', 'smell gas fumes in the car'], synonyms: ['exhaust fumes inside car'] },
    { id: 'exhaust_rotten_egg', label: 'Rotten Egg Smell From Exhaust', keywords: ['rotten egg smell from the exhaust', 'sulfur smell from the exhaust'], synonyms: ['rotten egg smell'] },

    // ---- Dashboard Warning Lights ----
    { id: 'dash_warning_light', label: 'Dashboard Warning Light', keywords: ['warning light on dashboard', 'dashboard light is on', 'indicator light on'], synonyms: ['dash light'] },
    { id: 'check_engine_light', label: 'Check Engine Light', keywords: ['check engine light', 'engine light is on', 'service engine soon'], synonyms: ['CEL'] },
    { id: 'oil_pressure_light', label: 'Oil Pressure Warning Light', keywords: ['oil pressure light is on', 'oil light is on', 'oil warning light'], synonyms: ['oil light on'] },
    { id: 'battery_charge_light', label: 'Battery / Charging Warning Light', keywords: ['battery light is on', 'charging system light is on', 'alternator light is on'], synonyms: ['battery warning light'] },
    { id: 'brake_warning_light', label: 'Brake Warning Light', keywords: ['brake warning light is on', 'brake light on the dashboard'], synonyms: ['brake light on dash'] },
    { id: 'coolant_temp_light', label: 'Coolant Temperature Warning Light', keywords: ['coolant warning light is on', 'temperature warning light is on', 'coolant light on the dashboard'], synonyms: ['coolant light on'] },
    { id: 'abs_light', label: 'ABS Warning Light', keywords: ['abs light is on', 'abs warning light'], synonyms: ['abs light on'] },
    { id: 'airbag_light', label: 'Airbag Warning Light', keywords: ['airbag light is on', 'airbag warning light', 'srs light is on'], synonyms: ['airbag light on'] },
    { id: 'traction_control_light', label: 'Traction Control Warning Light', keywords: ['traction control light is on', 'esp light is on', 'stability control light is on'], synonyms: ['traction control light on'] },
    { id: 'trans_warning_light', label: 'Transmission Warning Light', keywords: ['transmission warning light is on', 'check transmission light'], synonyms: ['trans light on'] }
  ];

  var KB = [
    // ===================== TIRES =====================
    {
      id: 'tire-slow-leak', title: 'Tire Slowly Losing Air', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_losing_air', weight: 0.9 }],
      causes: ['Punctured tire (nail/screw)', 'Damaged valve stem', 'Wheel/rim seal leak'],
      services: ['Tire puncture repair', 'Valve stem replacement', 'Tire pressure check'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Check tire pressure now and get the tire inspected soon before it goes fully flat.'
    },
    {
      id: 'tpms-warning', title: 'Tire Pressure Warning Light', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tpms_light', weight: 0.9 }, { id: 'tire_losing_air', weight: 0.3 }],
      causes: ['Low tire pressure', 'TPMS sensor fault', 'Temperature-related pressure drop'],
      services: ['Tire pressure check and inflation', 'TPMS sensor diagnostic'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Check and adjust tire pressure at your next stop; have the TPMS system scanned if the light stays on.'
    },
    {
      id: 'tire-noise-humming', title: 'Humming or Noisy Tires', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_noise', weight: 0.8 }, { id: 'tire_tread_wear', weight: 0.4 }],
      causes: ['Uneven or cupped tire wear', 'Wheel bearing wear', 'Tire rotation overdue'],
      services: ['Tire inspection and rotation', 'Wheel bearing inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Have your tires and wheel bearings checked at your next visit.'
    },
    {
      id: 'tire-uneven-wear', title: 'Uneven Tire Wear', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_tread_wear', weight: 0.9 }],
      causes: ['Improper wheel alignment', 'Under/over-inflation', 'Worn suspension components'],
      services: ['Wheel alignment', 'Tire rotation', 'Suspension inspection'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Schedule an alignment check soon to prevent further uneven wear and extend tire life.'
    },
    {
      id: 'tire-sidewall-bulge', title: 'Tire Sidewall Bulge', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_sidewall_bulge', weight: 1.0 }],
      causes: ['Impact damage to the tire structure', 'Internal belt separation'],
      services: ['Immediate tire inspection and replacement'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Stop driving on this tire and have it replaced immediately — a sidewall bulge can fail without warning.'
    },
    {
      id: 'tire-blowout-flat', title: 'Tire Blowout or Flat', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_blowout', weight: 1.0 }],
      causes: ['Tire blowout from damage or under-inflation', 'Complete puncture'],
      services: ['Tire replacement', 'Spare tire installation'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Pull over safely, do not continue driving on a flat or blown tire, and call us if you need assistance.'
    },
    {
      id: 'tire-dry-rot', title: 'Cracked or Dry-Rotted Tire', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_dry_rot', weight: 1.0 }],
      causes: ['Tire age (typically 6+ years)', 'UV/ozone exposure', 'Prolonged storage or low use'],
      services: ['Tire inspection and replacement'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: "Cracked sidewalls mean the tire's structure is compromised — have it inspected and replaced before it fails on the road."
    },
    {
      id: 'tire-low-tread', title: 'Low Tire Tread', category: 'tires', tireRelated: true,
      symptomGroups: [{ id: 'tire_low_tread', weight: 1.0 }],
      causes: ['Tires worn past the safe tread depth', 'Overdue tire replacement'],
      services: ['Tread depth check', 'Tire replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Low tread reduces wet-weather traction and stopping distance — schedule a tread check and replacement soon.',
      clarifyingQuestions: [
        { id: 'q-wear-bars', text: 'Can you see the wear bars flush with the tread?', appendOnYes: 'Yes, the tread is worn down to the wear bars, tires are bald.' }
      ]
    },

    // ===================== WHEELS =====================
    {
      id: 'wheel-imbalance-vibration', title: 'Vibration or Shimmy at Speed', category: 'wheels', tireRelated: true,
      symptomGroups: [{ id: 'vibration_highway', weight: 0.8 }, { id: 'steering_wheel_shake', weight: 0.6 }],
      causes: ['Unbalanced tire(s)', 'Bent wheel rim', 'Worn suspension component (tie rod, ball joint)'],
      services: ['Tire balancing', 'Wheel/rim inspection', 'Suspension inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: "Schedule a tire balance and front-end inspection soon — a growing vibration can wear suspension parts faster.",
      clarifyingQuestions: [
        { id: 'q-highway-only', text: 'Does it happen only at highway speeds?', appendOnYes: 'Yes, it vibrates at highway speed.' },
        { id: 'q-seat-vibration', text: 'Do you also feel vibration in the seat or floor?', appendOnYes: 'I also feel vibration in the seat and floor.' },
        { id: 'q-pothole', text: 'Did this start after hitting a pothole or curb?', appendOnYes: 'This started after hitting a pothole.' }
      ]
    },
    {
      id: 'wheel-bearing-noise', title: 'Wheel Bearing Noise', category: 'wheels', tireRelated: false,
      symptomGroups: [{ id: 'wheel_bearing_noise', weight: 0.9 }, { id: 'tire_noise', weight: 0.3 }],
      causes: ['Worn wheel bearing', 'Failing hub assembly'],
      services: ['Wheel bearing inspection', 'Bearing/hub replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the wheel bearing inspected soon — a failing bearing can worsen and affect steering control.',
      clarifyingQuestions: [
        { id: 'q-noise-changes-turning', text: 'Does the noise get louder when you turn?', appendOnYes: 'Yes, the noise changes when turning.' }
      ]
    },
    {
      id: 'wheel-bent-rim', title: 'Bent or Damaged Rim', category: 'wheels', tireRelated: false,
      symptomGroups: [{ id: 'wheel_bent_rim', weight: 1.0 }, { id: 'vibration_highway', weight: 0.3 }],
      causes: ['Impact with a pothole or curb', 'Bent or cracked wheel rim'],
      services: ['Wheel inspection', 'Rim repair or replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the wheel inspected soon — a bent rim can cause a persistent air leak or vibration.'
    },
    {
      id: 'wheel-loose-lug-nuts', title: 'Loose Wheel', category: 'wheels', tireRelated: false,
      symptomGroups: [{ id: 'wheel_loose', weight: 1.0 }],
      causes: ['Loose or missing lug nuts', 'Wheel not properly torqued after a recent service'],
      services: ['Immediate lug nut torque check'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Stop driving and have the wheel secured immediately — a loose wheel can separate from the vehicle.'
    },
    {
      id: 'wheel-curb-damage', title: 'Curb Damage to Wheel', category: 'wheels', tireRelated: false,
      symptomGroups: [{ id: 'wheel_curb_damage', weight: 1.0 }],
      causes: ['Cosmetic curb scrape on the rim'],
      services: ['Wheel cosmetic repair (optional)'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'This is usually cosmetic — have it inspected if you notice any air loss or vibration, otherwise repair is optional.'
    },

    // ===================== BRAKES =====================
    {
      id: 'brake-squeal-worn-pads', title: 'Squealing Brakes', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_squeal', weight: 0.9 }, { id: 'brake_noise_general', weight: 0.5 }],
      causes: ['Worn brake pads (wear-indicator contact)', 'Glazed brake pads', 'Dust or debris on the rotor'],
      services: ['Brake pad inspection and replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have your brake pads inspected soon — squealing is often an early wear-indicator warning.',
      clarifyingQuestions: [
        { id: 'q-sounds-squeal', text: 'Does it sound like squealing or squeaking?', appendOnYes: 'Yes, squealing brakes.' },
        { id: 'q-sounds-grind', text: 'Does it sound like grinding metal instead?', appendOnYes: 'Yes, brakes grinding, metal on metal brakes.' }
      ]
    },
    {
      id: 'brake-grinding-metal', title: 'Grinding Brakes', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_grind', weight: 1.0 }, { id: 'brake_noise_general', weight: 0.5 }],
      causes: ['Brake pads worn down to the metal backing', 'Damaged rotor surface'],
      services: ['Immediate brake pad and rotor inspection/replacement'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Get your brakes inspected immediately — grinding usually means metal-on-metal contact and reduced stopping power.',
      clarifyingQuestions: [
        { id: 'q-sounds-grind', text: 'Does it sound like grinding metal?', appendOnYes: 'Yes, brakes grinding, metal on metal brakes.' },
        { id: 'q-sounds-squeal', text: 'Does it sound like squealing or squeaking instead?', appendOnYes: 'Yes, squealing brakes.' }
      ]
    },
    {
      id: 'warped-brake-rotor', title: 'Pulsation When Braking', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_shake', weight: 0.8 }, { id: 'vibration_highway', weight: 0.3 }],
      causes: ['Warped brake rotor(s)', 'Uneven brake pad wear'],
      services: ['Brake rotor resurfacing or replacement', 'Brake pad inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have your brake rotors inspected soon — pulsation under braking usually means a warped rotor.',
      clarifyingQuestions: [
        { id: 'q-brake-only', text: 'Does the shaking happen mainly when you press the brakes?', appendOnYes: 'Yes, I feel it mainly when braking, car shakes when braking.' },
        { id: 'q-pothole', text: 'Did this start after hitting a pothole or curb?', appendOnYes: 'This started after hitting a pothole.' }
      ]
    },
    {
      id: 'brake-soft-pedal', title: 'Soft or Spongy Brake Pedal', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_soft_pedal', weight: 1.0 }],
      causes: ['Air in the brake lines', 'Brake fluid leak', 'Worn master cylinder'],
      services: ['Brake fluid flush/bleed', 'Brake line inspection', 'Master cylinder inspection'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'A soft or sinking brake pedal affects stopping power — have it inspected right away.'
    },
    {
      id: 'brake-hard-pedal', title: 'Hard or Stiff Brake Pedal', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_hard_pedal', weight: 1.0 }],
      causes: ['Failing brake booster', 'Vacuum leak affecting brake assist', 'Blocked brake line'],
      services: ['Brake booster inspection', 'Vacuum system check'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'A suddenly stiff pedal means reduced brake assist — have it inspected right away before driving further.'
    },
    {
      id: 'parking-brake-stuck', title: 'Parking Brake Stuck', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'parking_brake_stuck', weight: 1.0 }],
      causes: ['Seized parking brake cable', 'Rusted parking brake mechanism'],
      services: ['Parking brake inspection and lubrication/repair'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the parking brake inspected soon — driving with it partially engaged can overheat the brakes.'
    },
    {
      id: 'brake-fluid-leak', title: 'Brake Fluid Leak', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_fluid_leak', weight: 1.0 }, { id: 'brake_soft_pedal', weight: 0.4 }],
      causes: ['Leaking brake line or hose', 'Leaking wheel cylinder or caliper seal'],
      services: ['Brake fluid leak inspection and repair'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Do not drive with a brake fluid leak — have it inspected and repaired immediately.'
    },
    {
      id: 'car-pulls-brake-drag', title: 'Car Pulls — Brake Drag', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'car_pulls_side', weight: 0.5 }, { id: 'brake_grind', weight: 0.45 }],
      causes: ['Sticking brake caliper', 'Uneven brake pad wear pulling the car to one side'],
      services: ['Brake caliper inspection', 'Brake pad replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have your brakes inspected soon, especially if the pulling comes with any brake noise.',
      clarifyingQuestions: [
        { id: 'q-brake-noise', text: 'Do you also hear any grinding noise when braking?', appendOnYes: 'I also hear grinding noise when braking.' },
        { id: 'q-tread-wear', text: 'Is the tire tread wearing unevenly on one side?', appendOnYes: 'Yes, the tire is wearing on one side.' }
      ]
    },

    // ===================== STEERING =====================
    {
      id: 'car-pulls-alignment', title: 'Car Pulls — Alignment', category: 'steering', tireRelated: true,
      symptomGroups: [{ id: 'car_pulls_side', weight: 0.9 }, { id: 'tire_tread_wear', weight: 0.3 }],
      causes: ['Wheel alignment out of spec', 'Uneven tire pressure', 'Worn suspension component'],
      services: ['Wheel alignment', 'Tire pressure check', 'Suspension inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have your alignment checked soon — pulling can accelerate uneven tire wear.',
      clarifyingQuestions: [
        { id: 'q-tread-wear', text: 'Is the tire tread wearing unevenly on one side?', appendOnYes: 'Yes, the tire is wearing on one side.' },
        { id: 'q-brake-noise', text: 'Do you also hear any grinding noise when braking?', appendOnYes: 'I also hear grinding noise when braking.' }
      ]
    },
    {
      id: 'steering-heavy-power-steering', title: 'Hard or Heavy Steering', category: 'steering', tireRelated: false,
      symptomGroups: [{ id: 'hard_steering', weight: 1.0 }],
      causes: ['Low power steering fluid', 'Worn power steering belt or pump', 'Power steering rack issue'],
      services: ['Power steering fluid check', 'Belt inspection', 'Power steering system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have your power steering fluid and belt checked soon before it gets harder to steer.'
    },
    {
      id: 'steering-off-center', title: 'Steering Wheel Off-Center', category: 'steering', tireRelated: true,
      symptomGroups: [{ id: 'steering_off_center', weight: 1.0 }],
      causes: ['Wheel alignment off-center', 'Steering wheel not re-centered after a recent service'],
      services: ['Wheel alignment'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Schedule an alignment check to re-center your steering wheel.'
    },
    {
      id: 'steering-noise-turning', title: 'Noise When Turning the Wheel', category: 'steering', tireRelated: false,
      symptomGroups: [{ id: 'steering_noise_turning', weight: 1.0 }],
      causes: ['Low power steering fluid', 'Worn power steering pump'],
      services: ['Power steering fluid check', 'Power steering pump inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the power steering system checked soon before the pump wears further.'
    },
    {
      id: 'steering-play-loose', title: 'Loose or Excessive Play in Steering', category: 'steering', tireRelated: false,
      symptomGroups: [{ id: 'steering_play_loose', weight: 1.0 }],
      causes: ['Worn tie rod ends', 'Worn steering rack components', 'Worn steering coupling'],
      services: ['Steering linkage inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the steering linkage inspected soon — excess play can affect steering response.'
    },
    {
      id: 'car-wanders-unstable', title: 'Car Wanders at Speed', category: 'steering', tireRelated: true,
      symptomGroups: [{ id: 'car_wanders', weight: 1.0 }, { id: 'wheel_bearing_noise', weight: 0.2 }],
      causes: ['Worn suspension bushings', 'Alignment out of spec', 'Uneven tire pressure'],
      services: ['Alignment check', 'Suspension inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the alignment and suspension checked soon — wandering at speed can be tiring and unsafe over time.'
    },

    // ===================== SUSPENSION =====================
    {
      id: 'suspension-clunk-bumps', title: 'Clunking Over Bumps', category: 'suspension', tireRelated: false,
      symptomGroups: [{ id: 'suspension_clunk', weight: 1.0 }],
      causes: ['Worn sway bar links', 'Worn strut mounts', 'Loose suspension components'],
      services: ['Suspension inspection', 'Sway bar link/strut mount replacement'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have your suspension inspected soon — clunking usually points to worn linkage or mounts.',
      clarifyingQuestions: [
        { id: 'q-pothole', text: 'Did this start after hitting a pothole or curb?', appendOnYes: 'This started after hitting a pothole.' },
        { id: 'q-seat-vibration', text: 'Do you also feel vibration in the seat or floor?', appendOnYes: 'I also feel vibration in the seat and floor.' }
      ]
    },
    {
      id: 'suspension-bouncy-ride', title: 'Bouncy Ride', category: 'suspension', tireRelated: false,
      symptomGroups: [{ id: 'suspension_bouncy', weight: 1.0 }],
      causes: ['Worn shock absorbers or struts'],
      services: ['Shock/strut inspection and replacement'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have your shocks and struts inspected soon — worn shocks reduce control on rough roads.'
    },
    {
      id: 'suspension-sagging', title: 'Suspension Sagging on One Corner', category: 'suspension', tireRelated: false,
      symptomGroups: [{ id: 'suspension_sags', weight: 1.0 }],
      causes: ['Broken or weakened coil spring', 'Worn air suspension component (if equipped)'],
      services: ['Spring/suspension inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the suspension inspected soon — a sagging corner can affect handling and tire wear.'
    },
    {
      id: 'suspension-nose-dive-braking', title: 'Excessive Nose Dive When Braking', category: 'suspension', tireRelated: false,
      symptomGroups: [{ id: 'suspension_nose_dive', weight: 1.0 }],
      causes: ['Worn front struts/shocks'],
      services: ['Strut/shock inspection'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have your front struts inspected soon — excessive dive under braking usually means worn shocks.'
    },
    {
      id: 'cv-joint-clicking', title: 'Clicking Noise When Turning', category: 'suspension', tireRelated: false,
      symptomGroups: [{ id: 'cv_joint_click', weight: 1.0 }],
      causes: ['Worn or damaged CV joint', 'Torn CV boot'],
      services: ['CV joint/boot inspection and replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the CV joints inspected soon — a torn boot lets dirt in and accelerates joint failure.'
    },

    // ===================== ENGINE =====================
    {
      id: 'engine-rough-idle-stall', title: 'Rough Idle or Stalling', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'engine_rough_idle', weight: 1.0 }],
      causes: ['Dirty fuel injectors or throttle body', 'Vacuum leak', 'Failing idle control valve', 'Worn spark plugs'],
      services: ['Engine diagnostic scan', 'Fuel system cleaning', 'Spark plug inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Schedule a diagnostic scan soon — stalling can leave you stranded or unsafe in traffic.'
    },
    {
      id: 'engine-knocking-noise', title: 'Engine Knocking', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'engine_knock', weight: 1.0 }],
      causes: ['Low oil pressure or level', 'Worn engine bearings', 'Incorrect fuel octane causing pre-ignition'],
      services: ['Oil level and pressure check', 'Engine diagnostic'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Check your oil level right away and have the engine inspected — knocking can indicate serious internal wear.'
    },
    {
      id: 'engine-oil-leak', title: 'Oil Leak', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'oil_leak', weight: 1.0 }],
      causes: ['Worn valve cover gasket', 'Leaking oil pan gasket', 'Loose or failing oil filter', 'Worn front or rear main seal'],
      services: ['Oil leak inspection (dye test)', 'Gasket/seal replacement', 'Oil level top-off'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Check your oil level and have the leak source diagnosed soon — running low on oil can cause serious engine damage.',
      clarifyingQuestions: [
        { id: 'q-oil-level-low', text: 'Is your oil level low on the dipstick?', appendOnYes: 'Yes, the oil level is low.' }
      ]
    },
    {
      id: 'engine-loss-of-power', title: 'Loss of Engine Power', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'engine_loss_of_power', weight: 1.0 }],
      causes: ['Clogged air filter', 'Clogged fuel filter', 'Failing fuel pump', 'Vacuum leak'],
      services: ['Engine diagnostic scan', 'Fuel/air filter inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Schedule a diagnostic scan soon — reduced power can point to a fuel or air delivery issue.'
    },

    // ===================== COOLING SYSTEM =====================
    {
      id: 'engine-overheating', title: 'Engine Overheating', category: 'cooling', tireRelated: false,
      symptomGroups: [{ id: 'overheating', weight: 1.0 }],
      causes: ['Low coolant level', 'Failing water pump', 'Thermostat stuck closed', 'Radiator blockage or leak'],
      services: ['Coolant system inspection', 'Water pump/thermostat diagnostic'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: "Stop driving as soon as it's safe and let the engine cool — continuing to drive while overheating can cause serious engine damage."
    },
    {
      id: 'coolant-leak', title: 'Coolant Leak', category: 'cooling', tireRelated: false,
      symptomGroups: [{ id: 'coolant_leak', weight: 1.0 }],
      causes: ['Leaking radiator or hose', 'Leaking water pump', 'Leaking radiator cap or reservoir'],
      services: ['Coolant system leak inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the coolant leak located and repaired soon — low coolant can lead to overheating.'
    },
    {
      id: 'heater-not-working', title: 'No Heat From the Vents', category: 'cooling', tireRelated: false,
      symptomGroups: [{ id: 'no_heat', weight: 1.0 }],
      causes: ['Low coolant level', 'Stuck thermostat', 'Failing heater core or blend door'],
      services: ['Cooling system check', 'Heater core inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the cooling system and heater checked soon — no heat is often linked to low coolant.'
    },
    {
      id: 'overheats-in-traffic-idle', title: 'Overheats at Idle or in Traffic', category: 'cooling', tireRelated: false,
      symptomGroups: [{ id: 'overheat_in_traffic', weight: 1.0 }, { id: 'overheating', weight: 0.4 }],
      causes: ['Failing radiator cooling fan', 'Failing fan relay/motor'],
      services: ['Cooling fan diagnostic'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Have the cooling fan system checked right away — overheating that happens mainly at idle or in traffic usually means the fan isn’t running.'
    },

    // ===================== BATTERY & ELECTRICAL =====================
    {
      id: 'dead-battery-replace', title: 'Dead Battery', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'battery_dead', weight: 1.0 }, { id: 'dash_warning_light', weight: 0.2 }],
      causes: ['Battery has reached end of life', 'Battery drained fully (e.g., lights left on)'],
      services: ['Battery test and replacement'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'A jump start may get you moving, but have the battery tested — if it won’t hold a charge, it needs replacing.'
    },
    {
      id: 'battery-keeps-dying', title: 'Battery Keeps Dying', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'battery_keeps_dying', weight: 1.0 }],
      causes: ['Parasitic electrical drain (something staying on)', 'Failing alternator not fully recharging the battery', 'Old battery no longer holding a charge'],
      services: ['Charging system test', 'Parasitic draw test', 'Battery replacement'],
      safetyLevel: 'Low', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the charging system and battery tested soon — a battery that keeps dying usually has an underlying cause a jump start won’t fix.',
      clarifyingQuestions: [
        { id: 'q-battery-age', text: 'Is the battery more than 3-4 years old?', appendOnYes: 'Yes, the battery is old.' },
        { id: 'q-dies-overnight', text: 'Does it die overnight even after being driven that same day?', appendOnYes: 'Yes, it dies overnight, battery drains overnight.' }
      ]
    },
    {
      id: 'alternator-failing', title: 'Lights Dim or Flicker While Driving', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'lights_dim_while_driving', weight: 1.0 }, { id: 'battery_charge_light', weight: 0.3 }],
      causes: ['Failing alternator', 'Worn alternator belt', 'Loose electrical connection'],
      services: ['Charging system diagnostic', 'Alternator test/replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Flickering lights or dimming while driving usually means the alternator isn’t keeping up — have the charging system tested soon.'
    },
    {
      id: 'electrical-accessory-failure', title: 'Electrical Accessory Not Working', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'accessory_electrical_failure', weight: 1.0 }],
      causes: ['Blown fuse', 'Failing switch or motor', 'Wiring issue'],
      services: ['Electrical circuit diagnostic'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Have the affected circuit checked at your next visit — often just a blown fuse.'
    },
    {
      id: 'corroded-battery-terminals', title: 'Corroded Battery Terminals', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'corroded_terminals', weight: 1.0 }],
      causes: ['Corrosion buildup on battery terminals', 'Loose battery cable connection'],
      services: ['Battery terminal cleaning and inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the terminals cleaned and tightened soon — corrosion can cause intermittent electrical problems or a no-start.'
    },

    // ===================== STARTING SYSTEM =====================
    {
      id: 'starting-no-response', title: "Won't Start — No Response at All", category: 'starting', tireRelated: false,
      symptomGroups: [{ id: 'no_crank_no_sound', weight: 1.0 }, { id: 'battery_dead', weight: 0.3 }, { id: 'engine_wont_start', weight: 0.4 }],
      causes: ['Fully dead battery', 'Corroded or loose battery terminals', 'Broken ignition switch', 'Blown main fuse'],
      services: ['Battery and connection test', 'Ignition switch inspection'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Check for loose or corroded battery cables first; if the car is completely silent, the battery or a main fuse is the most likely cause.',
      clarifyingQuestions: [
        { id: 'q-any-lights', text: 'Do the dashboard or interior lights come on at all?', appendOnYes: 'Yes, some lights come on but it still wont start.' },
        { id: 'q-clicking', text: 'Do you hear rapid clicking when you turn the key?', appendOnYes: 'Yes, I hear a clicking sound no start when I try.' }
      ]
    },
    {
      id: 'starting-clicking-no-start', title: "Won't Start — Clicking Sound", category: 'starting', tireRelated: false,
      symptomGroups: [{ id: 'starting_click', weight: 1.0 }, { id: 'battery_dead', weight: 0.3 }, { id: 'engine_wont_start', weight: 0.4 }],
      causes: ['Weak or dead battery', 'Corroded battery terminals', 'Failing starter solenoid'],
      services: ['Battery test', 'Starter solenoid inspection'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'A rapid clicking sound usually means the battery lacks enough power to engage the starter — have the battery and starter tested.',
      clarifyingQuestions: [
        { id: 'q-dim-lights', text: 'Are your dashboard lights dim or not turning on at all?', appendOnYes: 'The battery is dead, no lights at all.' }
      ]
    },
    {
      id: 'starting-cranks-no-start', title: 'Cranks But Won’t Start', category: 'starting', tireRelated: false,
      symptomGroups: [{ id: 'cranks_no_start', weight: 1.0 }, { id: 'engine_wont_start', weight: 0.6 }],
      causes: ['Fuel delivery failure (pump, filter, or injectors)', 'No spark (ignition coil or spark plugs)', 'Timing belt/chain failure'],
      services: ['Starting system diagnostic', 'Fuel and ignition system check'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Cranking without starting usually points to a fuel or spark problem — have the starting system diagnosed.',
      clarifyingQuestions: [
        { id: 'q-clicking', text: 'Do you hear rapid clicking when you turn the key?', appendOnYes: 'Yes, I hear a clicking sound no start when I try.' }
      ]
    },
    {
      id: 'starting-slow-crank', title: 'Slow or Sluggish Crank', category: 'starting', tireRelated: false,
      symptomGroups: [{ id: 'slow_crank', weight: 1.0 }, { id: 'engine_wont_start', weight: 0.5 }],
      causes: ['Weak battery', 'Corroded battery cables', 'Failing starter motor'],
      services: ['Battery and starter test'],
      safetyLevel: 'Low', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'A slow crank is an early warning sign — have the battery and starter tested before it fails to start completely.'
    },
    {
      id: 'starting-intermittent', title: 'Intermittent Starting Problem', category: 'starting', tireRelated: false,
      symptomGroups: [{ id: 'intermittent_starting', weight: 1.0 }],
      causes: ['Failing starter motor', 'Weak battery losing capacity', 'Heat/cold-sensitive sensor or relay'],
      services: ['Starting system diagnostic'],
      safetyLevel: 'Low', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Intermittent starting problems tend to get worse — have the starting system diagnosed soon.'
    },

    // ===================== TRANSMISSION =====================
    {
      id: 'transmission-slipping', title: 'Transmission Slipping', category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'trans_slipping', weight: 1.0 }],
      causes: ['Low or degraded transmission fluid', 'Worn clutch packs/bands (automatic)', 'Failing torque converter'],
      services: ['Transmission fluid check', 'Transmission diagnostic'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Have the transmission inspected right away — slipping can quickly worsen into a full failure.'
    },
    {
      id: 'transmission-rough-shifting', title: 'Rough or Hard Shifting', category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'trans_rough_shifting', weight: 1.0 }],
      causes: ['Low transmission fluid', 'Worn engine/transmission mounts', 'Valve body issue'],
      services: ['Transmission fluid service', 'Mount inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the transmission fluid level and condition checked soon — rough shifting often starts as a fluid issue.'
    },
    {
      id: 'transmission-fluid-leak', title: 'Transmission Fluid Leak', category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'trans_fluid_leak', weight: 1.0 }],
      causes: ['Leaking pan gasket', 'Leaking seal', 'Leaking cooler line'],
      services: ['Transmission leak inspection and repair'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the leak source identified soon — low transmission fluid can cause serious internal damage.'
    },
    {
      id: 'transmission-wont-engage', title: "Won't Go Into Gear", category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'trans_wont_engage', weight: 1.0 }],
      causes: ['Very low transmission fluid', 'Shift cable/linkage issue', 'Internal transmission failure'],
      services: ['Transmission diagnostic'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Do not keep driving if the car won’t reliably go into gear — have it towed in for diagnosis.'
    },
    {
      id: 'transmission-whine-noise', title: 'Transmission Whine', category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'trans_whine_noise', weight: 1.0 }],
      causes: ['Low transmission fluid', 'Worn transmission bearings', 'Worn differential gears'],
      services: ['Transmission diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the transmission inspected soon — a whining noise that changes with speed or gear often points to internal wear.'
    },
    {
      id: 'clutch-slipping-manual', title: 'Clutch Slipping', category: 'transmission', tireRelated: false,
      symptomGroups: [{ id: 'clutch_slipping', weight: 1.0 }],
      causes: ['Worn clutch disc', 'Failing clutch pressure plate', 'Clutch fluid leak (hydraulic clutch)'],
      services: ['Clutch inspection and replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the clutch inspected soon — a slipping clutch will continue to wear and eventually won’t transmit power at all.'
    },

    // ===================== AIR CONDITIONING =====================
    {
      id: 'ac-not-cooling', title: 'AC Not Cooling', category: 'ac', tireRelated: false,
      symptomGroups: [{ id: 'ac_not_cold', weight: 1.0 }],
      causes: ['Low refrigerant (possible leak)', 'Failing AC compressor', 'Blocked cabin air filter'],
      services: ['AC system diagnostic and recharge', 'Compressor inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Schedule an AC system check when convenient — not a safety issue, just comfort.'
    },
    {
      id: 'ac-weak-airflow', title: 'Weak AC Airflow', category: 'ac', tireRelated: false,
      symptomGroups: [{ id: 'ac_weak_airflow', weight: 1.0 }],
      causes: ['Clogged cabin air filter', 'Failing blower motor', 'Blocked blend door'],
      services: ['Cabin air filter replacement', 'Blower motor inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Have the cabin air filter and blower checked at your next visit.'
    },
    {
      id: 'ac-bad-smell', title: 'AC Smells Bad', category: 'ac', tireRelated: false,
      symptomGroups: [{ id: 'ac_bad_smell', weight: 1.0 }],
      causes: ['Mold/mildew buildup in the evaporator', 'Dirty cabin air filter'],
      services: ['AC system cleaning', 'Cabin air filter replacement'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Have the cabin filter replaced and the AC system cleaned when convenient.'
    },
    {
      id: 'ac-cycling-noisy', title: 'AC Cycling or Noisy', category: 'ac', tireRelated: false,
      symptomGroups: [{ id: 'ac_cycling_noisy', weight: 1.0 }],
      causes: ['Low refrigerant', 'Failing AC compressor clutch'],
      services: ['AC system diagnostic', 'Compressor inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the AC system diagnosed soon — a cycling or noisy compressor can fail completely if not addressed.'
    },
    {
      id: 'ac-intermittent-cooling', title: 'AC Cools Intermittently', category: 'ac', tireRelated: false,
      symptomGroups: [{ id: 'ac_intermittent', weight: 1.0 }],
      causes: ['Low refrigerant (possible leak)', 'Failing condenser fan'],
      services: ['AC system diagnostic and recharge'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the AC system checked soon — inconsistent cooling is often an early sign of a refrigerant leak.'
    },

    // ===================== EXHAUST =====================
    {
      id: 'exhaust-rattle-noise', title: 'Exhaust Rattle or Noise', category: 'exhaust', tireRelated: false,
      symptomGroups: [{ id: 'exhaust_noise', weight: 1.0 }],
      causes: ['Loose or broken exhaust hanger', 'Damaged heat shield', 'Failing muffler'],
      services: ['Exhaust system inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Have the exhaust system inspected at your next visit — usually not urgent, but it can get louder.'
    },
    {
      id: 'exhaust-smoke', title: 'Smoke From Exhaust', category: 'exhaust', tireRelated: false,
      symptomGroups: [{ id: 'exhaust_smoke', weight: 1.0 }],
      causes: ['Blue smoke: burning oil (worn piston rings/valve seals)', 'White smoke: coolant burning (head gasket)', 'Black smoke: excess fuel (injector or sensor issue)'],
      services: ['Engine diagnostic to identify the smoke source'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Note the smoke color and have the engine inspected soon — the likely cause varies a lot by color.'
    },
    {
      id: 'exhaust-loud-roar', title: 'Sudden Loud Exhaust', category: 'exhaust', tireRelated: false,
      symptomGroups: [{ id: 'exhaust_loud', weight: 1.0 }, { id: 'exhaust_noise', weight: 0.3 }],
      causes: ['Hole or rust-through in the muffler/pipe', 'Disconnected exhaust section'],
      services: ['Exhaust system inspection and repair'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the exhaust system inspected soon — a sudden increase in noise usually means a leak or break in the pipe.'
    },
    {
      id: 'exhaust-fumes-in-cabin', title: 'Exhaust Fumes in Cabin', category: 'exhaust', tireRelated: false,
      symptomGroups: [{ id: 'exhaust_fumes_smell', weight: 1.0 }],
      causes: ['Exhaust leak routing fumes toward the cabin', 'Damaged exhaust seal near the floor/trunk'],
      services: ['Immediate exhaust leak inspection'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Drive with windows down for ventilation only long enough to get it inspected immediately — exhaust fumes in the cabin can be a carbon monoxide risk.'
    },
    {
      id: 'catalytic-converter-rotten-egg', title: 'Rotten Egg Smell From Exhaust', category: 'exhaust', tireRelated: false,
      symptomGroups: [{ id: 'exhaust_rotten_egg', weight: 1.0 }],
      causes: ['Failing or overheating catalytic converter', 'Fuel mixture running rich'],
      services: ['Catalytic converter and fuel system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have the catalytic converter and fuel system checked soon.'
    },

    // ===================== DASHBOARD WARNING LIGHTS =====================
    {
      id: 'check-engine-light-on', title: 'Check Engine Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'check_engine_light', weight: 1.0 }],
      causes: ['Loose or faulty gas cap', 'Oxygen sensor issue', 'Catalytic converter issue', 'Engine misfire'],
      services: ['OBD-II diagnostic scan'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Bring your vehicle in for a diagnostic scan soon to read the stored trouble code.'
    },
    {
      id: 'oil-pressure-warning-light', title: 'Oil Pressure Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'oil_pressure_light', weight: 1.0 }],
      causes: ['Low oil level', 'Failing oil pump', 'Low oil pressure'],
      services: ['Oil level check', 'Oil pressure diagnostic'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Stop driving as soon as safely possible and check the oil level — continuing to drive with low oil pressure can destroy the engine.'
    },
    {
      id: 'battery-charge-warning-light', title: 'Battery / Charging Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'battery_charge_light', weight: 1.0 }],
      causes: ['Failing alternator', 'Worn serpentine belt', 'Loose battery connection'],
      services: ['Charging system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Have the charging system checked as soon as possible — this light means the battery isn’t being recharged while you drive.'
    },
    {
      id: 'brake-warning-light-dash', title: 'Brake Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'brake_warning_light', weight: 1.0 }],
      causes: ['Low brake fluid', 'Parking brake left partially engaged', 'ABS/brake system fault'],
      services: ['Brake fluid check', 'Brake system diagnostic'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Check that the parking brake is fully released and check brake fluid level; if the light stays on, have the brake system inspected immediately.'
    },
    {
      id: 'coolant-temp-warning-light', title: 'Coolant Temperature Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'coolant_temp_light', weight: 1.0 }],
      causes: ['Low coolant level', 'Cooling system fault'],
      services: ['Coolant level check', 'Cooling system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Check your coolant level when the engine is cool and have the cooling system inspected soon.'
    },
    {
      id: 'abs-warning-light', title: 'ABS Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'abs_light', weight: 1.0 }],
      causes: ['Faulty ABS wheel speed sensor', 'ABS module fault'],
      services: ['ABS system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Regular brakes still work, but have the ABS system scanned soon to restore anti-lock protection.'
    },
    {
      id: 'airbag-warning-light', title: 'Airbag Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'airbag_light', weight: 1.0 }],
      causes: ['Airbag/SRS system fault', 'Loose seat occupancy or clockspring connector'],
      services: ['Airbag system diagnostic'],
      safetyLevel: 'Medium', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the airbag system scanned soon — this light means the airbags may not deploy properly in a crash.'
    },
    {
      id: 'traction-control-warning-light', title: 'Traction Control Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'traction_control_light', weight: 1.0 }],
      causes: ['Wheel speed sensor fault', 'Traction control system fault', 'Worn tires triggering false slip detection'],
      services: ['Traction control diagnostic'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Have the traction control system scanned soon to identify the trigger.'
    },
    {
      id: 'transmission-warning-light-dash', title: 'Transmission Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'trans_warning_light', weight: 1.0 }],
      causes: ['Low transmission fluid', 'Transmission fault code stored'],
      services: ['Transmission diagnostic scan'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'Have the transmission scanned soon — this light usually means a fault code is stored and continued driving could cause damage.'
    },
    {
      id: 'dashboard-warning-light-general', title: 'Dashboard Warning Light', category: 'dashboard', tireRelated: false,
      symptomGroups: [{ id: 'dash_warning_light', weight: 1.0 }],
      causes: ['Depends on which specific light is illuminated', 'Sensor fault', 'Fluid level warning'],
      services: ['Diagnostic scan to identify the specific warning'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Note which specific light is on and have it scanned soon so we can pinpoint the cause.'
    }
  ];

  window.MechanicSymptomGroups = SYMPTOM_GROUPS;
  window.MechanicKB = KB;
})();
