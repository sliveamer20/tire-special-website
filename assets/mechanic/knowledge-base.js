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
 * To expand later: add a new symptom group, add a new scenario, add keywords/
 * synonyms to an existing group, or re-weight an existing scenario. This file
 * is pure data — assets/mechanic/diagnosis-engine.js never needs to change.
 */
(function () {
  var SYMPTOM_GROUPS = [
    { id: 'vibration_highway', label: 'Vibration at Highway Speed', keywords: ['vibration at highway speed', 'vibrates at highway speed', 'shakes at highway speed', 'vibration at speed', 'shaking at speed'], synonyms: ['shimmy', 'wobble', 'judder', 'vibration in the seat', 'vibration in the floor'] },
    { id: 'steering_wheel_shake', label: 'Steering Wheel Shakes', keywords: ['steering wheel shakes', 'steering wheel vibrates', 'wheel shakes', 'shaking steering wheel'], synonyms: ['wobbly steering'] },
    { id: 'car_pulls_side', label: 'Car Pulls to One Side', keywords: ['pulls to one side', 'car pulls', 'pulling to the left', 'pulling to the right', 'drifts to one side'], synonyms: ['veers left', 'veers right'] },
    { id: 'tire_losing_air', label: 'Tire Losing Air', keywords: ['tire keeps losing air', 'tire loses air', 'tire going flat', 'losing tire pressure', 'slow leak'], synonyms: ['deflating tire'] },
    { id: 'tire_noise', label: 'Tire Noise', keywords: ['tire noise', 'humming from tires', 'tire humming', 'roaring noise from wheels'], synonyms: ['whining tires', 'buzzing tires'] },
    { id: 'tire_tread_wear', label: 'Uneven Tire Wear', keywords: ['uneven tread wear', 'tire wearing unevenly', 'wearing on one side', 'bald spots on tire'], synonyms: ['cupped tires', 'feathered tread'] },
    { id: 'tire_sidewall_bulge', label: 'Tire Sidewall Bulge', keywords: ['bulge on tire', 'bubble on tire', 'sidewall bulge', 'tire bubble'], synonyms: ['sidewall bump'] },
    { id: 'tpms_light', label: 'Tire Pressure Warning Light', keywords: ['tire pressure light', 'tpms light', 'low tire pressure warning'], synonyms: ['tire warning light'] },
    { id: 'tire_blowout', label: 'Tire Blowout / Flat', keywords: ['tire blew out', 'flat tire', 'tire burst', 'sudden flat'], synonyms: ['blowout'] },
    { id: 'brake_squeal', label: 'Brake Squeal', keywords: ['brakes squeal', 'squealing brakes', 'squeaky brakes'], synonyms: ['screeching brakes'] },
    { id: 'brake_grind', label: 'Brake Grinding', keywords: ['brakes grinding', 'grinding noise when braking', 'metal on metal brakes'], synonyms: ['grinding brakes'] },
    { id: 'brake_noise_general', label: 'Brake Noise', keywords: ['brake noise', 'noise from brakes', 'brakes making noise', 'noise when braking'], synonyms: [] },
    { id: 'brake_soft_pedal', label: 'Soft Brake Pedal', keywords: ['brake pedal feels soft', 'spongy brake pedal', 'brake pedal sinks'], synonyms: ['mushy brakes'] },
    { id: 'brake_shake', label: 'Shaking When Braking', keywords: ['car shakes when braking', 'shaking when i brake', 'vibration when braking', 'pulsing brake pedal'], synonyms: ['brake pulsation'] },
    { id: 'hard_steering', label: 'Hard/Heavy Steering', keywords: ['hard to steer', 'steering feels heavy', 'difficult to turn the wheel', 'stiff steering'], synonyms: ['heavy steering'] },
    { id: 'steering_off_center', label: 'Steering Wheel Off-Center', keywords: ['steering wheel off center', 'steering wheel crooked', 'wheel not straight'], synonyms: ['crooked steering wheel'] },
    { id: 'suspension_clunk', label: 'Clunking Over Bumps', keywords: ['clunking noise over bumps', 'clunk over bumps', 'knocking over bumps'], synonyms: ['rattling over bumps', 'hitting a pothole', 'after hitting a pothole'] },
    { id: 'engine_wont_start', label: "Engine Won't Start", keywords: ['car wont start', "car won't start", 'engine wont start', 'clicking when starting', 'no crank'], synonyms: ["won't turn over"] },
    { id: 'engine_rough_idle', label: 'Rough Idle / Stalling', keywords: ['rough idle', 'car stalls', 'engine stalling', 'shaking at idle', 'sputtering engine'], synonyms: ['stalls at stop'] },
    { id: 'check_engine_light', label: 'Check Engine Light', keywords: ['check engine light', 'engine light is on', 'service engine soon'], synonyms: ['CEL'] },
    { id: 'engine_knock', label: 'Engine Knocking', keywords: ['knocking noise from engine', 'engine knocking', 'tapping noise from engine'], synonyms: ['pinging engine', 'ticking engine'] },
    { id: 'battery_dead', label: 'Dead Battery', keywords: ['battery is dead', 'wont turn over at all', 'clicking sound no start'], synonyms: ['dead battery'] },
    { id: 'dash_warning_light', label: 'Dashboard Warning Light', keywords: ['warning light on dashboard', 'dashboard light is on', 'indicator light on'], synonyms: ['dash light'] },
    { id: 'overheating', label: 'Engine Overheating', keywords: ['engine overheating', 'temperature gauge is high', 'car is overheating', 'steam from hood'], synonyms: ['running hot'] },
    { id: 'ac_not_cold', label: 'AC Not Cold', keywords: ['ac not cold', 'air conditioning not working', 'ac blowing warm air'], synonyms: ['air conditioner broken'] },
    { id: 'exhaust_noise', label: 'Exhaust Noise', keywords: ['exhaust rattle', 'loud exhaust', 'rattling under the car'], synonyms: ['muffler noise'] },
    { id: 'exhaust_smoke', label: 'Exhaust Smoke', keywords: ['smoke from exhaust', 'blue smoke', 'white smoke', 'black smoke from exhaust'], synonyms: ['smoking exhaust'] }
  ];

  var KB = [
    {
      id: 'tire-imbalance-vibration', title: 'Vibration or Shimmy at Speed', category: 'tires', tireRelated: true,
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
      id: 'car-pulls-brake-drag', title: 'Car Pulls — Brake Drag', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'car_pulls_side', weight: 0.5 }, { id: 'brake_grind', weight: 0.3 }],
      causes: ['Sticking brake caliper', 'Uneven brake pad wear pulling the car to one side'],
      services: ['Brake caliper inspection', 'Brake pad replacement'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Have your brakes inspected soon, especially if the pulling comes with any brake noise.',
      clarifyingQuestions: [
        { id: 'q-brake-noise', text: 'Do you also hear any grinding noise when braking?', appendOnYes: 'I also hear grinding noise when braking.' },
        { id: 'q-tread-wear', text: 'Is the tire tread wearing unevenly on one side?', appendOnYes: 'Yes, the tire is wearing on one side.' }
      ]
    },
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
      id: 'brake-soft-pedal', title: 'Soft or Spongy Brake Pedal', category: 'brakes', tireRelated: false,
      symptomGroups: [{ id: 'brake_soft_pedal', weight: 1.0 }],
      causes: ['Air in the brake lines', 'Brake fluid leak', 'Worn master cylinder'],
      services: ['Brake fluid flush/bleed', 'Brake line inspection', 'Master cylinder inspection'],
      safetyLevel: 'High', canDrive: 'Caution', repairPriority: 'Immediate',
      nextStep: 'A soft or sinking brake pedal affects stopping power — have it inspected right away.'
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
      id: 'engine-wont-start-battery', title: "Won't Start — Likely Battery", category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'engine_wont_start', weight: 0.6 }, { id: 'battery_dead', weight: 0.9 }],
      causes: ['Dead or weak battery', 'Corroded battery terminals', 'Faulty alternator'],
      services: ['Battery test and replacement', 'Charging system diagnostic'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Have your battery and charging system tested — a jump start may get you moving, but the cause still needs diagnosing.',
      clarifyingQuestions: [
        { id: 'q-clicking', text: 'Do you hear rapid clicking when you turn the key?', appendOnYes: 'Yes, I hear a clicking sound no start when I try.' },
        { id: 'q-dim-lights', text: 'Are your dashboard lights dim or not turning on at all?', appendOnYes: 'The battery is dead, no lights at all.' },
        { id: 'q-cranks-no-click', text: 'Does the engine crank but just not catch, with no clicking sound?', appendOnYes: "Engine wont start, it cranks but won't turn over, no clicking." }
      ]
    },
    {
      id: 'engine-wont-start-starter', title: "Won't Start — Starter/Ignition", category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'engine_wont_start', weight: 0.9 }],
      causes: ['Faulty starter motor', 'Failed ignition switch', 'Fuel delivery issue'],
      services: ['Starter system diagnostic', 'Ignition system inspection'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Have the starting system diagnosed before attempting further starts to avoid draining the battery.',
      clarifyingQuestions: [
        { id: 'q-cranks-no-click', text: 'Does the engine crank but just not catch, with no clicking sound?', appendOnYes: "Engine wont start, it cranks but won't turn over, no clicking." },
        { id: 'q-clicking', text: 'Do you hear rapid clicking when you turn the key?', appendOnYes: 'Yes, I hear a clicking sound no start when I try.' }
      ]
    },
    {
      id: 'engine-rough-idle-stall', title: 'Rough Idle or Stalling', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'engine_rough_idle', weight: 1.0 }],
      causes: ['Dirty fuel injectors or throttle body', 'Vacuum leak', 'Failing idle control valve', 'Worn spark plugs'],
      services: ['Engine diagnostic scan', 'Fuel system cleaning', 'Spark plug inspection'],
      safetyLevel: 'Medium', canDrive: 'Caution', repairPriority: 'Soon',
      nextStep: 'Schedule a diagnostic scan soon — stalling can leave you stranded or unsafe in traffic.'
    },
    {
      id: 'check-engine-light-on', title: 'Check Engine Light', category: 'engine', tireRelated: false,
      symptomGroups: [{ id: 'check_engine_light', weight: 1.0 }],
      causes: ['Loose or faulty gas cap', 'Oxygen sensor issue', 'Catalytic converter issue', 'Engine misfire'],
      services: ['OBD-II diagnostic scan'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Soon',
      nextStep: 'Bring your vehicle in for a diagnostic scan soon to read the stored trouble code.'
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
      id: 'dead-battery-no-start', title: 'Dead Battery', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'battery_dead', weight: 1.0 }, { id: 'dash_warning_light', weight: 0.4 }],
      causes: ['Dead battery', 'Loose or corroded battery cable', 'Parasitic electrical drain'],
      services: ['Battery test and replacement', 'Charging system inspection'],
      safetyLevel: 'Low', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: 'Have your battery and electrical system tested before it leaves you stranded again.',
      clarifyingQuestions: [
        { id: 'q-dim-lights', text: 'Are your dashboard lights dim or not turning on at all?', appendOnYes: 'The battery is dead, no lights at all.' },
        { id: 'q-clicking', text: 'Do you hear rapid clicking when you turn the key?', appendOnYes: 'Yes, I hear a clicking sound no start when I try.' }
      ]
    },
    {
      id: 'dashboard-warning-light-general', title: 'Dashboard Warning Light', category: 'electrical', tireRelated: false,
      symptomGroups: [{ id: 'dash_warning_light', weight: 1.0 }],
      causes: ['Depends on which specific light is illuminated', 'Sensor fault', 'Fluid level warning'],
      services: ['Diagnostic scan to identify the specific warning'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Note which specific light is on and have it scanned soon so we can pinpoint the cause.'
    },
    {
      id: 'engine-overheating', title: 'Engine Overheating', category: 'cooling', tireRelated: false,
      symptomGroups: [{ id: 'overheating', weight: 1.0 }],
      causes: ['Low coolant level', 'Failing water pump', 'Thermostat stuck closed', 'Radiator blockage or leak'],
      services: ['Coolant system inspection', 'Water pump/thermostat diagnostic'],
      safetyLevel: 'High', canDrive: 'No', repairPriority: 'Immediate',
      nextStep: "Stop driving as soon as it's safe and let the engine cool — continuing to drive while overheating can cause serious engine damage."
    },
    {
      id: 'ac-not-cooling', title: 'AC Not Cooling', category: 'comfort', tireRelated: false,
      symptomGroups: [{ id: 'ac_not_cold', weight: 1.0 }],
      causes: ['Low refrigerant (possible leak)', 'Failing AC compressor', 'Blocked cabin air filter'],
      services: ['AC system diagnostic and recharge', 'Compressor inspection'],
      safetyLevel: 'Low', canDrive: 'Yes', repairPriority: 'Monitor',
      nextStep: 'Schedule an AC system check when convenient — not a safety issue, just comfort.'
    },
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
    }
  ];

  window.MechanicSymptomGroups = SYMPTOM_GROUPS;
  window.MechanicKB = KB;
})();
