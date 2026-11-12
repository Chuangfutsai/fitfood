import type { Recipe } from '../food/recipes';
import { strings } from './strings';

type NameTranslation = { en: string };
type CardioTranslation = { name: string; steps: string[] };

export const dishTranslations: Record<string, NameTranslation & { wheelEn: string }> = {
  'dish-tomato-egg': { en: 'Tomato & Egg Stir-fry', wheelEn: 'Tomato Egg' },
  'dish-chicken-broccoli': { en: 'Chicken & Broccoli Stir-fry', wheelEn: 'Chicken Broccoli' },
  'dish-pork-cabbage': { en: 'Pork & Cabbage Stir-fry', wheelEn: 'Pork Cabbage' },
  'dish-beef-bokchoy': { en: 'Beef & Bok Choy Stir-fry', wheelEn: 'Beef Greens' },
  'dish-chicken-spinach': { en: 'Chicken & Spinach Stir-fry', wheelEn: 'Chicken Spinach' },
  'dish-ground-pork-zucchini': { en: 'Ground Pork & Zucchini Stir-fry', wheelEn: 'Zucchini Mince' },
  'dish-egg-spinach': { en: 'Spinach & Egg Stir-fry', wheelEn: 'Spinach Egg' },
  'dish-pork-pepper': { en: 'Pork & Bell Pepper Stir-fry', wheelEn: 'Pork Pepper' },
  'dish-beef-broccoli': { en: 'Beef & Broccoli Stir-fry', wheelEn: 'Beef Broccoli' },
  'dish-chicken-tomato': { en: 'Chicken & Tomato Stir-fry', wheelEn: 'Chicken Tomato' },
  'dish-pork-baby-corn': { en: 'Pork & Baby Corn Stir-fry', wheelEn: 'Pork Corn' },
  'dish-beef-cabbage': { en: 'Beef & Cabbage Stir-fry', wheelEn: 'Beef Cabbage' },
  'dish-chicken-cucumber': { en: 'Chicken & Cucumber Stir-fry', wheelEn: 'Chicken Cucumber' },
  'dish-ground-pork-tomato': { en: 'Ground Pork & Tomato Stir-fry', wheelEn: 'Tomato Mince' },
  'dish-tenderloin-broccoli': { en: 'Pork Loin & Broccoli Stir-fry', wheelEn: 'Pork Broccoli' },
  'dish-chicken-thigh-zucchini': { en: 'Chicken Thigh & Zucchini Stir-fry', wheelEn: 'Chicken Zucchini' },
  'dish-beef-carrot': { en: 'Beef & Carrot Stir-fry', wheelEn: 'Beef Carrot' },
  'dish-egg-pepper': { en: 'Bell Pepper & Egg Stir-fry', wheelEn: 'Pepper Egg' },
  'dish-chicken-cabbage-noodle': { en: 'Chicken & Cabbage Stir-fried Noodles', wheelEn: 'Cabbage Noodles' },
  'dish-pork-spinach-noodle': { en: 'Pork & Spinach Noodle Soup', wheelEn: 'Spinach Noodles' },
  'dish-beef-tomato-noodle': { en: 'Beef & Tomato Noodle Soup', wheelEn: 'Tomato Noodles' },
  'dish-chicken-sweetpotato': { en: 'Chicken Breast & Roasted Sweet Potato', wheelEn: 'Chicken Bake' },
  'dish-pork-potato': { en: 'Pork & Potato Stew', wheelEn: 'Pork Potato' },
  'dish-beef-potato': { en: 'Beef & Potato Stew', wheelEn: 'Beef Potato' },
  'dish-egg-potato': { en: 'Potato Frittata', wheelEn: 'Potato Frittata' },
  'dish-chicken-rice': { en: 'Scallion Chicken Rice', wheelEn: 'Scallion Rice' },
  'dish-ground-pork-rice': { en: 'Ground Pork & Onion Rice', wheelEn: 'Pork Rice' },
  'dish-beef-onion-rice': { en: 'Beef & Onion Rice', wheelEn: 'Beef Rice' },
  'dish-chicken-pasta': { en: 'Chicken Pasta', wheelEn: 'Chicken Pasta' },
  'dish-ground-pork-pasta': { en: 'Pork & Tomato Pasta', wheelEn: 'Pork Pasta' },
  'dish-beef-pasta': { en: 'Beef & Bell Pepper Pasta', wheelEn: 'Beef Pasta' },
  'dish-egg-noodle': { en: 'Scallion & Egg Stir-fried Noodles', wheelEn: 'Scallion Noodles' },
  'dish-chicken-bokchoy-rice': { en: 'Chicken & Bok Choy Rice', wheelEn: 'Chicken Rice' },
  'dish-pork-carrot-rice': { en: 'Pork & Carrot Rice', wheelEn: 'Carrot Rice' },
  'dish-beef-pepper-rice': { en: 'Beef & Bell Pepper Rice', wheelEn: 'Pepper Rice' },
  'dish-chicken-baby-corn': { en: 'Chicken & Baby Corn Stir-fry', wheelEn: 'Chicken Corn' },
  'dish-ground-pork-cabbage': { en: 'Ground Pork & Cabbage Stir-fry', wheelEn: 'Cabbage Mince' },
  'dish-pork-zucchini': { en: 'Pork & Zucchini Stir-fry', wheelEn: 'Pork Zucchini' },
  'dish-beef-spinach': { en: 'Beef & Spinach Stir-fry', wheelEn: 'Beef Spinach' },
  'dish-chicken-carrot': { en: 'Chicken & Carrot Stir-fry', wheelEn: 'Chicken Carrot' },
  'dish-pork-tomato': { en: 'Pork & Tomato Stir-fry', wheelEn: 'Pork Tomato' },
  'dish-beef-cucumber': { en: 'Beef & Cucumber Stir-fry', wheelEn: 'Beef Cucumber' },
  'dish-egg-tomato-noodle': { en: 'Tomato & Egg Noodle Soup', wheelEn: 'Egg Noodles' },
  'dish-chicken-spinach-pasta': { en: 'Chicken & Spinach Pasta', wheelEn: 'Spinach Pasta' },
  'dish-ground-pork-potato': { en: 'Ground Pork & Potato Stir-fry', wheelEn: 'Potato Mince' },
  'dish-beef-zucchini': { en: 'Beef & Zucchini Stir-fry', wheelEn: 'Beef Zucchini' },
  'dish-tenderloin-pepper': { en: 'Pork Loin & Bell Pepper Stir-fry', wheelEn: 'Pepper Loin' },
  'dish-chicken-thigh-cabbage': { en: 'Chicken Thigh & Cabbage Stir-fry', wheelEn: 'Chicken Cabbage' },
  'dish-beef-bokchoy-noodle': { en: 'Beef & Bok Choy Noodle Soup', wheelEn: 'Beef Noodles' },
  'dish-chicken-pepper-noodle': { en: 'Chicken & Bell Pepper Stir-fried Noodles', wheelEn: 'Pepper Noodles' },
};

export const ingredientTranslations: Record<string, NameTranslation> = {
  'ing-egg': { en: 'Eggs' },
  'ing-chicken': { en: 'Chicken Breast' },
  'ing-chicken-thigh': { en: 'Boneless Chicken Thigh' },
  'ing-pork': { en: 'Sliced Pork' },
  'ing-ground-pork': { en: 'Ground Pork' },
  'ing-beef': { en: 'Sliced Beef' },
  'ing-ground-beef': { en: 'Ground Beef' },
  'ing-pork-tenderloin': { en: 'Pork Loin' },
  'ing-broccoli': { en: 'Broccoli' },
  'ing-bokchoy': { en: 'Bok Choy' },
  'ing-cabbage': { en: 'Cabbage' },
  'ing-tomato': { en: 'Tomatoes' },
  'ing-spinach': { en: 'Spinach' },
  'ing-pepper': { en: 'Bell Peppers' },
  'ing-zucchini': { en: 'Zucchini' },
  'ing-carrot': { en: 'Carrots' },
  'ing-baby-corn': { en: 'Baby Corn' },
  'ing-cucumber': { en: 'Cucumber' },
  'ing-rice': { en: 'White Rice' },
  'ing-noodle': { en: 'Noodles' },
  'ing-sweetpotato': { en: 'Sweet Potato' },
  'ing-potato': { en: 'Potatoes' },
  'ing-pasta': { en: 'Pasta' },
  'ing-scallion': { en: 'Scallions' },
  'ing-garlic': { en: 'Garlic' },
  'ing-onion': { en: 'Onions' },
  'ing-ginger': { en: 'Ginger' },
  'ing-salt': { en: 'Salt' },
  'ing-pepper-seasoning': { en: 'Black Pepper' },
};

export const cardioTranslations: Record<
  string,
  { en: CardioTranslation }
> = {
  'cardio-treadmill-12330': {
    en: {
      name: '12-3-30 Incline Walk',
      steps: [
        'Warm up for 5 minutes: 1% incline · 2.5 mph · 4.0 km/h',
        'Main workout for 20 minutes: 12% incline · 3.0 mph · 4.8 km/h',
        'Cool down for 5 minutes: 1% incline · 2.5 mph · 4.0 km/h',
      ],
    },
  },
  'cardio-treadmill-steady': {
    en: {
      name: 'Steady Brisk Walk',
      steps: [
        'Warm up for 5 minutes: 1% incline · 2.5 mph · 4.0 km/h',
        'Walk briskly for 15 minutes: 3% incline · 3.5 mph · 5.6 km/h',
        'Cool down for 5 minutes: 1% incline · 2.5 mph · 4.0 km/h',
      ],
    },
  },
  'cardio-treadmill-interval': {
    en: {
      name: 'Run-Walk Intervals',
      steps: [
        'Warm up for 5 minutes: 1% incline · 2.8 mph · 4.5 km/h',
        'Repeat 5 rounds: jog for 2 minutes · 1% incline · 5.5 mph · 8.9 km/h',
        'After each round, walk briskly for 1 minute: 1% incline · 3.0 mph · 4.8 km/h',
        'Cool down for 4 minutes: 1% incline · 2.5 mph · 4.0 km/h',
      ],
    },
  },
  'cardio-stair-steady': {
    en: {
      name: 'Steady StairMaster Climb',
      steps: [
        'Warm up for 4 minutes: level 3–4',
        'Climb steadily for 12 minutes: level 6–7',
        'Cool down for 4 minutes: level 3–4',
      ],
    },
  },
  'cardio-stair-interval': {
    en: {
      name: 'StairMaster Intervals',
      steps: [
        'Warm up for 4 minutes: level 3–4',
        'Repeat 6 rounds: climb fast for 1 minute at level 9–10',
        'After each round, recover for 1 minute: level 4–5',
        'Cool down for 6 minutes: level 3–4',
      ],
    },
  },
  'cardio-stair-endurance': {
    en: {
      name: 'StairMaster Endurance',
      steps: [
        'Warm up for 5 minutes: level 3–4',
        'Endurance climb for 20 minutes: level 6–8',
        'Cool down for 5 minutes: level 3–4',
      ],
    },
  },
};

export const exerciseTranslations: Record<string, NameTranslation> = {
  '槓鈴臥推': { en: 'Barbell Bench Press' },
  '啞鈴肩推': { en: 'Dumbbell Shoulder Press' },
  '上斜啞鈴臥推': { en: 'Incline Dumbbell Bench Press' },
  '側平舉': { en: 'Lateral Raise' },
  '滑輪三頭下壓': { en: 'Cable Triceps Pushdown' },
  '高位下拉': { en: 'Lat Pulldown' },
  '坐姿划船': { en: 'Seated Row' },
  '單手啞鈴划船': { en: 'Single-Arm Dumbbell Row' },
  '臉拉': { en: 'Face Pull' },
  '啞鈴彎舉': { en: 'Dumbbell Curl' },
  '深蹲': { en: 'Squat' },
  '羅馬尼亞硬舉': { en: 'Romanian Deadlift' },
  '腿推機': { en: 'Leg Press' },
  '腿後腱彎舉': { en: 'Leg Curl' },
  '站姿提踵': { en: 'Standing Calf Raise' },
  '高腳杯深蹲': { en: 'Goblet Squat' },
  '啞鈴臥推': { en: 'Dumbbell Bench Press' },
  '啞鈴羅馬尼亞硬舉': { en: 'Dumbbell Romanian Deadlift' },
  '平板撐': { en: 'Plank' },
  '推日基礎訓練': { en: 'Push Day Basics' },
  '拉日基礎訓練': { en: 'Pull Day Basics' },
  '腿日基礎訓練': { en: 'Leg Day Basics' },
  '全身基礎訓練': { en: 'Full-Body Basics' },
  '30–45 秒': { en: '30–45 sec' },
};

export const recipeTranslations: Record<string, Recipe> = {
    "dish-tomato-egg": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Eggs",
          "amount": "2 large (about 100g without shells)"
        },
        {
          "name": "Tomato",
          "amount": "1 (about 200g)"
        },
        {
          "name": "Onion",
          "amount": "40g"
        },
        {
          "name": "Scallion",
          "amount": "1 (about 8g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "2 tsp (10ml)"
        },
        {
          "name": "Salt",
          "amount": "1/4 tsp"
        },
        {
          "name": "Sugar",
          "amount": "1/2 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "30ml"
        }
      ],
      "steps": [
        "Spend about 3 minutes prepping: core the tomato and cut it into 8 wedges, slice the onion 3mm thick, and finely slice the scallion. Beat the eggs with half the salt.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add 1 tsp oil. Pour in the eggs and gently push them into large curds for about 60 seconds. Transfer to a plate while still moist; they will finish cooking later.",
        "Add the remaining 1 tsp oil to the pan. Stir-fry the onion over medium heat for 90 seconds until translucent at the edges, then add the tomato and cook for 1 minute.",
        "Add the water, sugar, white pepper and remaining salt. Cover and simmer over medium-low heat for 3 minutes, until the tomato softens at the edges and releases its juice.",
        "Return the eggs and gently fold over medium heat for 60–90 seconds, until completely set with no liquid egg remaining and lightly coated in sauce.",
        "Add all the scallion, stir-fry for 15 seconds, then turn off the heat and serve. Total preparation and cooking time is about 12 minutes."
      ],
      "tip": "Split the measured oil between the eggs and vegetables, then return the eggs at the end for tender results with just 2 tsp oil.",
      "kcal": 295,
      "proteinG": 15
    },
    "dish-chicken-broccoli": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Chicken breast",
          "amount": "150g (skinless, raw weight)"
        },
        {
          "name": "Broccoli",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "60ml"
        }
      ],
      "steps": [
        "Slice the chicken across the grain into 5mm pieces. Mix with the soy sauce, rice wine, potato starch and 15ml water; marinate for 5 minutes. Meanwhile, cut the broccoli into 3cm florets, peel and thinly slice the thick stem, and slice the garlic.",
        "Put the broccoli and 30ml water in a nonstick pan. Cover and steam over medium heat for 3 minutes, until bright green and a chopstick can pierce the stem. Transfer to a plate.",
        "Wipe the pan dry and preheat over medium heat for 30 seconds. Add all the oil and spread out the chicken. Cook for 2 minutes, turn and cook for 1 minute more.",
        "Push the chicken to the edge. Cook the garlic in the center for 20 seconds, then stir-fry it with the chicken for 1 minute.",
        "Return the broccoli and add the remaining 15ml water, salt and black pepper. Stir-fry over medium heat for 2 minutes, until the thickest chicken piece reaches 74°C.",
        "Turn the heat to high and toss for 30 seconds to evaporate excess liquid. Serve when the broccoli is still crisp and the chicken has a light coating of sauce. Allow about 18 minutes overall."
      ],
      "tip": "Marinate chicken with water and potato starch, and steam the broccoli first, so a quick stir-fry stays tender with little oil.",
      "kcal": 320,
      "proteinG": 40
    },
    "dish-pork-cabbage": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced pork",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Cabbage",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "45ml"
        }
      ],
      "steps": [
        "Prep for about 4 minutes: cut the pork into 2–3mm slices and mix with the soy sauce, rice wine, potato starch and 15ml water. Cut cabbage leaves into 4cm pieces, thinly slice thick ribs, and slice the garlic.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the pork and cook for 90 seconds, then turn and stir-fry for 30 seconds. Transfer to a clean plate.",
        "Cook the garlic in the same pan over medium heat for 20 seconds. Add the cabbage ribs and stir-fry for 1 minute, then add the leaves and stir-fry for 1 minute.",
        "Add the remaining 30ml water, cover and cook over medium heat for 2 minutes. The leaves should look glossy and the ribs should soften without becoming mushy.",
        "Return the pork and its juices. Add the salt and white pepper and stir-fry over medium-high heat for 2 minutes, until the pork reaches 71°C in the center.",
        "Toss for another 30–60 seconds, leaving only a thin coating of vegetable juices, then serve. Total time is about 15 minutes."
      ],
      "tip": "Use lean pork and finish the cabbage with a little water, so it softens without soaking up extra oil.",
      "kcal": 330,
      "proteinG": 34
    },
    "dish-beef-bokchoy": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced beef",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Bok choy",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "45ml"
        }
      ],
      "steps": [
        "Slice the beef across the grain into 2mm pieces. Mix with the soy sauce, rice wine, potato starch and 15ml water; marinate for 3 minutes. Meanwhile, wash the bok choy, separate stems and leaves, cut into 4cm lengths, and slice the garlic.",
        "Preheat a nonstick pan over medium-high heat for 30 seconds and add all the oil. Spread out the beef, sear for 45 seconds and stir-fry for another 45 seconds. Transfer to a plate.",
        "Lower the heat to medium. Stir-fry the garlic for 20 seconds, then add the bok choy stems and cook for 1 minute.",
        "Add the remaining 30ml water and cover for 1 minute. Add the leaves and stir-fry for 1 minute until just wilted.",
        "Return the beef and its juices, add the white pepper, and stir-fry over medium-high heat for 1–2 minutes. The beef should reach 71°C in the center while the stems remain crisp.",
        "Turn off the heat and serve immediately rather than leaving it covered, which can dull the greens. Preparation and cooking take about 12 minutes."
      ],
      "tip": "Thinly sliced, marinated beef and plenty of bok choy make a tender, satisfying plate without adding more oil.",
      "kcal": 320,
      "proteinG": 34
    },
    "dish-chicken-spinach": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Chicken breast",
          "amount": "150g (skinless, raw weight)"
        },
        {
          "name": "Spinach",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "30ml"
        }
      ],
      "steps": [
        "Slice the chicken across the grain into 5mm pieces. Marinate with the soy sauce, rice wine, potato starch and 15ml water for 5 minutes. Meanwhile, wash the spinach thoroughly, cut into 5cm lengths and separate stems from leaves; slice the garlic.",
        "Preheat a nonstick pan over medium heat for 30 seconds, then add all the oil. Spread out the chicken and cook for 2 minutes; turn and cook for 1 minute.",
        "Add the garlic and stir-fry over medium heat for 30 seconds. Add the remaining 15ml water, cover and cook for 1 minute.",
        "Add the spinach stems and stir-fry for 1 minute. Add the leaves, salt and white pepper, then toss over medium heat for 1–2 minutes.",
        "Check that the thickest chicken piece reaches 74°C. The leaves should be just wilted and bright green; if the chicken is below temperature, continue cooking and recheck.",
        "Toss over high heat for 20 seconds and serve at once, so the spinach does not sit and release excess water. Allow about 15 minutes overall."
      ],
      "tip": "Drain the spinach well and cook stems before leaves to shorten cooking time without relying on extra oil.",
      "kcal": 300,
      "proteinG": 39
    },
    "dish-ground-pork-zucchini": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Ground pork",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Zucchini",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Sugar",
          "amount": "1/4 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "30ml"
        }
      ],
      "steps": [
        "Prep for about 4 minutes: halve the zucchini lengthwise and cut into 5mm half-moons; mince the garlic. Mix the soy sauce, rice wine, sugar and water in a small bowl.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add all the oil and pork. Break the pork into small crumbles and cook for 3 minutes.",
        "Push the pork aside and cook the garlic for 20 seconds until fragrant, then stir it through the pork.",
        "Add the zucchini, increase to medium-high heat and stir-fry for 2 minutes, letting both sides touch the pan and lightly brown.",
        "Pour in the sauce, lower to medium heat, cover and cook for 2 minutes. Uncover and stir-fry for 1 minute, until the pork reaches 71°C and the zucchini edges look translucent but the centers still have bite.",
        "Add the black pepper and toss over high heat for 30 seconds to reduce the sauce to a light coating. Serve; total time is about 15 minutes."
      ],
      "tip": "Choose lean ground pork and keep the zucchini slices thick enough to stay juicy, so 1 tsp oil is enough to build flavor.",
      "kcal": 360,
      "proteinG": 31
    },
    "dish-egg-spinach": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Eggs",
          "amount": "3 large (about 150g without shells)"
        },
        {
          "name": "Spinach",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Salt",
          "amount": "1/4 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "15ml"
        }
      ],
      "steps": [
        "Prep for about 3 minutes: wash and drain the spinach, cut into 4cm lengths, and separate stems from leaves. Mince the garlic. Beat the eggs with the salt, white pepper and water.",
        "Preheat a nonstick pan over medium heat for 30 seconds. Add all the oil and cook the garlic for 15 seconds until fragrant, without browning.",
        "Stir-fry the spinach stems for 45 seconds, then add the leaves and cook for 45 seconds until just wilted, with no large pool of water in the pan.",
        "Spread the spinach evenly, reduce to medium-low heat and pour in the eggs. Leave for 20 seconds, then gently push from the edges toward the center to form large curds.",
        "Continue folding over medium-low heat for 1–2 minutes, until all the egg is set and the center of the curds reaches 71°C.",
        "Turn off the heat and serve immediately so residual heat does not dry out the eggs. Total time is about 10 minutes."
      ],
      "tip": "Beat 15ml water into the eggs and cook gently over medium-low heat for soft curds with just 1 tsp oil.",
      "kcal": 320,
      "proteinG": 25
    },
    "dish-pork-pepper": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced pork",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Bell peppers",
          "amount": "180g (90g red and 90g yellow)"
        },
        {
          "name": "Onion",
          "amount": "50g"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "45ml"
        }
      ],
      "steps": [
        "Cut the pork across the grain into 3mm slices and marinate with 1 tsp soy sauce, the rice wine, potato starch and 15ml water for 4 minutes. Meanwhile, deseed the peppers and cut into 1cm strips; slice the onion 5mm thick.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the pork, sear for 90 seconds, turn and stir-fry for 30 seconds, then transfer to a plate.",
        "Stir-fry the onion in the same pan over medium heat for 90 seconds until translucent at the edges. Add the peppers and cook for 2 minutes.",
        "Add the remaining 30ml water and 1 tsp soy sauce. Cover and cook for 1 minute so the peppers soften slightly but remain crisp.",
        "Return the pork and its juices and add the black pepper. Stir-fry over medium-high heat for 2 minutes, until the thickest slice reaches 71°C.",
        "Toss for another 30 seconds until the pork is lightly coated in sauce. Turn off the heat and serve; allow about 15 minutes overall."
      ],
      "tip": "Let the onion and peppers provide natural sweetness, and reduce the sauce to a light coating instead of adding sugar.",
      "kcal": 345,
      "proteinG": 34
    },
    "dish-beef-broccoli": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced beef",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Broccoli",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "60ml"
        }
      ],
      "steps": [
        "Slice the beef across the grain into 2–3mm pieces and marinate with 1 tsp soy sauce, the rice wine, potato starch and 15ml water for 4 minutes. Meanwhile, cut the broccoli into 3cm florets, peel and slice thick stems, and mince the garlic.",
        "Put the broccoli in a nonstick pan with 30ml water. Cover and cook over medium heat for 3 minutes until bright green and slightly tender, then transfer to a plate.",
        "Wipe the pan dry and preheat over medium-high heat for 30 seconds. Add all the oil and beef, sear in one layer for 1 minute, then stir-fry for 30 seconds.",
        "Add the garlic and cook for 20 seconds. Return the broccoli and add the remaining 1 tsp soy sauce and 15ml water.",
        "Stir-fry over medium-high heat for 1–2 minutes, until the beef reaches 71°C in the center and the broccoli is evenly coated in sauce.",
        "Add the black pepper, toss for 20 seconds and serve. Preparation and cooking take about 15 minutes."
      ],
      "tip": "Steam the broccoli with a little water first so it needs only a quick final toss, using less oil and keeping its bright color.",
      "kcal": 360,
      "proteinG": 37
    },
    "dish-chicken-tomato": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Chicken breast",
          "amount": "150g (skinless, raw weight)"
        },
        {
          "name": "Tomato",
          "amount": "1 (about 200g)"
        },
        {
          "name": "Onion",
          "amount": "60g"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "Sugar",
          "amount": "1/4 tsp"
        },
        {
          "name": "Water",
          "amount": "45ml"
        }
      ],
      "steps": [
        "Slice the chicken across the grain into 5mm pieces and marinate with the soy sauce, rice wine, potato starch and 15ml water for 4 minutes. Meanwhile, cut the tomato into 8 wedges and slice the onion 5mm thick.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the chicken, cook for 2 minutes, turn and cook for 1 minute, then transfer to a plate.",
        "Stir-fry the onion in the same pan for 1 minute. Add the tomato and cook over medium heat for 1 minute, letting the cut sides touch the pan.",
        "Add the remaining 30ml water, salt and sugar. Cover and simmer over medium-low heat for 2 minutes, until the tomato softens at the edges and releases red juices.",
        "Return the chicken and its juices. Fold over medium heat for 2 minutes, until the chicken reaches 74°C in the center and is coated in the tomato sauce.",
        "Cook over high heat for 30 seconds to thicken the sauce slightly, keeping the tomato wedges intact. Turn off the heat and serve; allow about 15 minutes."
      ],
      "tip": "Ripe tomatoes make their own sweet-tart sauce; the small amount of sugar balances acidity without a heavy sweet glaze.",
      "kcal": 305,
      "proteinG": 36
    },
    "dish-pork-baby-corn": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced pork",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Baby corn",
          "amount": "150g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "60ml"
        }
      ],
      "steps": [
        "Cut the pork into 3mm slices and marinate with the soy sauce, rice wine, potato starch and 15ml water for 4 minutes. Meanwhile, halve the baby corn lengthwise and cut long pieces in half; thinly slice the garlic.",
        "Put the baby corn and 30ml water in a nonstick pan. Cover and cook over medium heat for 3 minutes, until a chopstick can pierce it but it still has bite. Transfer to a plate.",
        "Wipe the pan dry and preheat over medium heat for 30 seconds. Add all the oil and pork, sear in one layer for 90 seconds, then turn and stir-fry for 30 seconds.",
        "Add the garlic and cook over medium heat for 20 seconds until fragrant. Return the baby corn and stir-fry for 1 minute.",
        "Add the remaining 15ml water, salt and white pepper. Stir-fry over medium heat for 2 minutes, until the pork reaches 71°C in the center.",
        "Toss over high heat for 30 seconds to evaporate excess moisture, then serve immediately. Total time is about 15 minutes."
      ],
      "tip": "Halve and briefly steam baby corn before stir-frying so it cooks evenly and takes on flavor without extra oil.",
      "kcal": 335,
      "proteinG": 35
    },
    "dish-beef-cabbage": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced beef",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Cabbage",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "45ml"
        }
      ],
      "steps": [
        "Slice the beef across the grain into 2–3mm pieces and marinate with 1 tsp soy sauce, the rice wine, potato starch and 15ml water for 4 minutes. Cut cabbage leaves into 4cm pieces, thinly slice thick ribs, and slice the garlic.",
        "Preheat a nonstick pan over medium-high heat for 30 seconds. Add all the oil and beef, sear for 1 minute and stir-fry for 30 seconds, then transfer to a plate.",
        "Lower the heat to medium and cook the garlic for 20 seconds until fragrant. Add the cabbage ribs and stir-fry for 1 minute, then add the leaves and cook for 1 minute.",
        "Add the remaining 30ml water and 1 tsp soy sauce. Cover and cook over medium heat for 2 minutes, until the leaves are tender and the ribs still have bite.",
        "Return the beef and its juices, add the black pepper, and stir-fry over medium-high heat for 1–2 minutes, until the center of the beef reaches 71°C.",
        "Cook uncovered for another 30 seconds to reduce the juices to a light coating, then serve. Allow about 15 minutes overall."
      ],
      "tip": "Thinly slice thick cabbage ribs and cook them before the leaves so they soften without repeated additions of oil.",
      "kcal": 340,
      "proteinG": 35
    },
    "dish-chicken-cucumber": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Chicken breast",
          "amount": "150g (skinless, raw weight)"
        },
        {
          "name": "Cucumber",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "30ml"
        }
      ],
      "steps": [
        "Slice the chicken across the grain into 4mm pieces and marinate with the soy sauce, rice wine, potato starch and 15ml water for 3 minutes. Meanwhile, slice the cucumber diagonally 4mm thick and slice the garlic.",
        "Preheat a nonstick pan over medium heat for 30 seconds. Add all the oil and chicken, cook in one layer for 2 minutes, then turn and stir-fry for 1 minute.",
        "Add the garlic and cook for 20 seconds. Pour in the remaining 15ml water, cover and cook over medium heat for 1 minute.",
        "Uncover and check that the thickest chicken slice reaches 74°C. If it is below temperature, keep cooking until it is ready before adding the cucumber.",
        "Add the cucumber, salt and white pepper. Stir-fry over medium-high heat for 90 seconds, until the cucumber edges turn slightly translucent but the centers remain crisp.",
        "Toss over high heat for 15 seconds, turn off the heat and serve before the cucumber releases too much water. Allow about 12 minutes overall."
      ],
      "tip": "Cook the chicken through first, then briefly stir-fry the cucumber to keep it crisp with just 1 tsp oil.",
      "kcal": 280,
      "proteinG": 35
    },
    "dish-ground-pork-tomato": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Ground pork",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Tomato",
          "amount": "1 (about 200g)"
        },
        {
          "name": "Onion",
          "amount": "60g"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Sugar",
          "amount": "1/4 tsp"
        },
        {
          "name": "White pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "40ml"
        }
      ],
      "steps": [
        "Prep for about 4 minutes: core the tomato and cut into 8 wedges, then slice the onion 5mm thick. Mix the soy sauce, rice wine, sugar and water.",
        "Preheat a nonstick pan over medium heat for 30 seconds. Add all the oil and pork, breaking it into small crumbles as you cook for 3 minutes until separated and fragrant.",
        "Add the onion and stir-fry over medium heat for 90 seconds, until translucent at the edges.",
        "Add the tomato and stir-fry for 1 minute. Pour in the sauce, cover and simmer over medium-low heat for 3 minutes, allowing the tomato to release its juice.",
        "Uncover, stir and check that the pork reaches 71°C. The tomato should still have distinct pieces and the sauce should be naturally red.",
        "Add the white pepper and reduce over medium-high heat for 1 minute, until the sauce lightly coats the pork. Turn off the heat and serve; allow about 15 minutes."
      ],
      "tip": "Choose lean ground pork and keep the tomato in chunks for a satisfying portion without adding a sugary sauce.",
      "kcal": 375,
      "proteinG": 31
    },
    "dish-tenderloin-broccoli": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Pork loin",
          "amount": "150g (outer fat trimmed, raw weight)"
        },
        {
          "name": "Broccoli",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "1 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/8 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "60ml"
        }
      ],
      "steps": [
        "Slice the pork loin across the grain into 3mm pieces and lightly tenderize with the back of a knife. Marinate with the soy sauce, rice wine, potato starch and 15ml water for 5 minutes. Cut broccoli into 3cm florets, peel and slice thick stems, and slice the garlic.",
        "Put the broccoli in a nonstick pan with 30ml water. Cover and steam over medium heat for 3 minutes, until a chopstick can pierce the stems but they remain crisp. Transfer to a plate.",
        "Wipe the pan dry and preheat over medium heat for 30 seconds. Add all the oil and pork, sear in one layer for 2 minutes, turn and cook for 1 minute.",
        "Add the garlic and stir-fry for 20 seconds. Return the broccoli, then add the remaining 15ml water, salt and black pepper.",
        "Stir-fry over medium heat for 2 minutes, until the thickest pork slice reaches 71°C and is evenly coated in sauce.",
        "Toss over high heat for 30 seconds to evaporate excess liquid, then serve. Preparation and cooking take about 18 minutes."
      ],
      "tip": "Thin slices cut across the grain, gentle tenderizing and a brief starch marinade keep lean pork tender without extra oil.",
      "kcal": 335,
      "proteinG": 37
    },
    "dish-chicken-thigh-zucchini": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Boneless chicken thigh",
          "amount": "150g (skinless, raw weight)"
        },
        {
          "name": "Zucchini",
          "amount": "200g"
        },
        {
          "name": "Garlic",
          "amount": "2 cloves (about 6g)"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Salt",
          "amount": "1/4 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/4 tsp"
        },
        {
          "name": "Water",
          "amount": "30ml"
        }
      ],
      "steps": [
        "Pat the chicken dry, trim visible fat and cut into 2cm pieces. Marinate with the rice wine, half the salt and half the black pepper for 5 minutes. Cut the zucchini into 7mm half-moons and slice the garlic.",
        "Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the chicken and sear for 3 minutes without moving it frequently.",
        "Turn and cook for 2 minutes. Add the garlic and stir-fry for 20 seconds, then add the water, cover and cook over medium-low heat for 3 minutes.",
        "Uncover and check that the largest chicken piece reaches 74°C, then transfer the chicken to a plate, leaving the small amount of fat and juices in the pan.",
        "Add the zucchini to the same pan and stir-fry over medium-high heat for 3 minutes, until lightly golden at the edges and just tender in the center. Add the remaining salt and black pepper.",
        "Return the chicken and toss for 30 seconds to combine, without adding more oil. Serve; total time is about 20 minutes."
      ],
      "tip": "Remove the skin and visible fat, then use the small amount of pan juices to cook the zucchini without adding more oil.",
      "kcal": 305,
      "proteinG": 32
    },
    "dish-beef-carrot": {
      "servings": 1,
      "ingredients": [
        {
          "name": "Sliced beef",
          "amount": "150g (lean, raw weight)"
        },
        {
          "name": "Carrot",
          "amount": "150g"
        },
        {
          "name": "Onion",
          "amount": "80g"
        }
      ],
      "seasonings": [
        {
          "name": "Cooking oil",
          "amount": "1 tsp (5ml)"
        },
        {
          "name": "Soy sauce",
          "amount": "2 tsp"
        },
        {
          "name": "Rice wine",
          "amount": "1 tsp"
        },
        {
          "name": "Potato starch",
          "amount": "1 tsp"
        },
        {
          "name": "Black pepper",
          "amount": "1/8 tsp"
        },
        {
          "name": "Water",
          "amount": "75ml"
        }
      ],
      "steps": [
        "Slice the beef across the grain into 2–3mm pieces. Marinate with 1 tsp soy sauce, the rice wine, potato starch and 15ml water for 5 minutes. Meanwhile, peel and cut the carrot into 2mm half-moons and slice the onion 5mm thick.",
        "Put the carrot and 45ml water in a nonstick pan. Cover and cook over medium heat for 4 minutes, until a chopstick pierces it with slight resistance in the center. Transfer to a plate.",
        "Wipe the pan dry and preheat over medium-high heat for 30 seconds. Add all the oil and beef, sear for 1 minute and stir-fry for 30 seconds, then transfer to a plate.",
        "Lower the heat to medium and cook the onion for 2 minutes until translucent. Return the carrot and add the remaining 1 tsp soy sauce and 15ml water.",
        "Return the beef and its juices and stir-fry over medium-high heat for 1–2 minutes. The beef should reach 71°C in the center and the carrots should be tender but hold their shape.",
        "Add the black pepper and toss for 30 seconds to reduce the sauce to a light coating. Turn off the heat and serve; allow about 18 minutes."
      ],
      "tip": "Thinly slice and steam the carrots with a little water first to bring out their sweetness without prolonged frying.",
      "kcal": 375,
      "proteinG": 34
    },
  "dish-egg-pepper": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Eggs",
        "amount": "2 large (about 100 g without shells)"
      },
      {
        "name": "Bell peppers",
        "amount": "180 g (90 g each red and yellow)"
      },
      {
        "name": "Onion",
        "amount": "40 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "1 tbsp (15 ml)"
      }
    ],
    "steps": [
      "Spend about 3 minutes preparing the vegetables: wash and seed the peppers, then cut into 2 cm diamond-shaped pieces. Slice the onion into 5 mm strips.",
      "Beat the eggs with half the salt and all the white pepper for 30 seconds.",
      "Heat a nonstick pan over medium heat for 30 seconds. Add 1 tsp oil, pour in the eggs and gently push them into curds for 45–60 seconds, until mostly set. Transfer to a plate.",
      "Add the remaining 1 tsp oil to the pan. Stir-fry the onion over medium heat for 1 minute, then add the peppers, 15 ml water and remaining salt. Cook for 3 minutes, until the onion is translucent and the peppers are crisp-tender.",
      "Return the eggs and fold gently over medium-low heat for 1 minute. Serve when the eggs are fully set with no runny egg remaining and the pan is no longer watery."
    ],
    "tip": "Cook the eggs and vegetables separately in a nonstick pan to keep the eggs tender with just 2 tsp oil.",
    "kcal": 300,
    "proteinG": 15
  },
  "dish-chicken-cabbage-noodle": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Chicken breast",
        "amount": "150 g (raw, skinless)"
      },
      {
        "name": "Cabbage",
        "amount": "150 g"
      },
      {
        "name": "Wheat noodles",
        "amount": "70 g (dry, thin noodles)"
      },
      {
        "name": "Carrot",
        "amount": "30 g"
      },
      {
        "name": "Scallion",
        "amount": "10 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Potato starch",
        "amount": "1 tsp (3 g)"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "1000 ml for boiling + 60 ml for stir-frying"
      }
    ],
    "steps": [
      "Bring 1000 ml water to a boil over high heat. Meanwhile, spend about 5 minutes cutting the chicken across the grain into 5 mm strips, the cabbage into 3 cm pieces and the carrot into thin matchsticks. Cut the scallion into 3 cm lengths, keeping the white and green parts separate.",
      "Mix the chicken with 1 tsp soy sauce, the rice wine and potato starch; marinate for 5 minutes. Meanwhile, boil the noodles over medium-high heat for 1 minute less than the package time, about 4–6 minutes. Drain.",
      "Heat 1 tsp oil in a wok over medium heat. Spread out the chicken and cook for 2 minutes, then stir-fry for 1 minute. Transfer to a plate.",
      "Add the remaining 1 tsp oil. Stir-fry the scallion whites and carrot over medium heat for 1 minute. Add the cabbage and 30 ml water, cover and cook for 2 minutes to soften the leaves slightly.",
      "Add the noodles, chicken, remaining 1 tsp soy sauce, white pepper and remaining 30 ml water. Toss with chopsticks over medium-high heat for 2–3 minutes, until the thickest chicken strip reaches 74°C.",
      "Add the scallion greens and toss over high heat for 30 seconds to evaporate the remaining liquid. The noodles should be tender with a little bite."
    ],
    "tip": "Use cabbage to make the portion more filling and keep the dry noodles to 70 g to manage the meal’s calories.",
    "kcal": 555,
    "proteinG": 43
  },
  "dish-pork-spinach-noodle": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced pork",
        "amount": "140 g (lean, about 2 mm thick)"
      },
      {
        "name": "Spinach",
        "amount": "150 g"
      },
      {
        "name": "Wheat noodles",
        "amount": "70 g (dry, thin noodles)"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Ginger",
        "amount": "5 g"
      },
      {
        "name": "Soy sauce",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "1000 ml for noodles + 400 ml for broth"
      }
    ],
    "steps": [
      "Spend about 4 minutes washing and trimming the spinach. Cut into 5 cm lengths, keeping stems and leaves separate. Cut the ginger into fine matchsticks and separate the pork slices.",
      "Heat the oil in a small saucepan over medium heat and fry the ginger for 30 seconds. Add 400 ml water, soy sauce, salt and rice wine. Bring to a boil over high heat, about 2 minutes, then reduce to a gentle simmer.",
      "In a second pot, bring 1000 ml water to a boil. Add the noodles and cook over medium-high heat for 5–7 minutes, following the package time, until no hard center remains. Drain into a serving bowl.",
      "While the noodles cook, add the pork slices individually to the broth. Simmer over medium heat for 2–3 minutes, until the pork reaches 71°C. Skim any foam from the surface.",
      "Add the spinach stems and simmer for 30 seconds, then add the leaves for another 30–45 seconds, until wilted but still bright green.",
      "Stir in the white pepper. Pour the broth, spinach and pork over the noodles, loosen gently and serve immediately."
    ],
    "tip": "Ginger and white pepper add aroma without extra oil; cooking the noodles separately keeps the broth light.",
    "kcal": 530,
    "proteinG": 39
  },
  "dish-beef-tomato-noodle": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced beef",
        "amount": "140 g (lean, about 2 mm thick)"
      },
      {
        "name": "Tomato",
        "amount": "1 medium (about 200 g)"
      },
      {
        "name": "Wheat noodles",
        "amount": "70 g (dry, thin noodles)"
      },
      {
        "name": "Scallion",
        "amount": "10 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Salt",
        "amount": "1/8 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "1000 ml for noodles + 350 ml for broth"
      }
    ],
    "steps": [
      "Spend about 4 minutes cutting the washed tomato into 8 wedges. Thinly slice the scallion, separating the white and green parts, and cut the beef into 4 cm lengths.",
      "Heat the oil in a saucepan over medium heat. Fry the scallion whites for 20 seconds, then add the tomato and cook for 2 minutes, pressing a few pieces to release their juice.",
      "Add 350 ml water, soy sauce, salt and rice wine. Bring to a boil over high heat, then cover and simmer over low heat for 6 minutes, until the tomato is soft and the broth turns red.",
      "Meanwhile, bring 1000 ml water to a boil in another pot. Cook the noodles over medium-high heat for 5–7 minutes, following the package time, until cooked through. Drain into a bowl.",
      "Turn the broth to medium heat. Add the beef slices one at a time, separate gently and simmer for 2–3 minutes, until the beef reaches 71°C. Turn off the heat.",
      "Add the black pepper, ladle the tomato and beef broth over the noodles and scatter all the scallion greens on top."
    ],
    "tip": "Cooking the tomato until juicy before adding water builds a flavorful broth with less soy sauce.",
    "kcal": 560,
    "proteinG": 40
  },
  "dish-chicken-sweetpotato": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Chicken breast",
        "amount": "150 g (raw, skinless)"
      },
      {
        "name": "Sweet potato",
        "amount": "200 g (skin on)"
      },
      {
        "name": "Black pepper",
        "amount": "1/4 tsp"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Water",
        "amount": "1 tbsp (15 ml)"
      }
    ],
    "steps": [
      "Preheat the oven to 220°C, allowing about 8 minutes. Meanwhile, spend about 4 minutes scrubbing the sweet potato and cutting it into long wedges about 2 cm thick. Butterfly the chicken into an even 1.5 cm-thick piece.",
      "Place the sweet potato in a microwave-safe dish with 15 ml water. Cover with a vented lid and microwave at 800W for 3 minutes. Drain and pat the surface dry.",
      "Rub the chicken with the rice wine, 1 tsp oil, half the salt and half the black pepper. Toss the sweet potato with the remaining oil, salt and pepper.",
      "Line a baking tray with parchment. Arrange the chicken and sweet potato separately in a single layer and roast on the middle rack at 220°C for 8 minutes.",
      "Turn the chicken and wedges, then roast for another 4–7 minutes. Remove the chicken once its thickest part reaches 74°C. The sweet potato should have browned edges and be easily pierced with a fork.",
      "Rest the chicken for 3 minutes, then slice across the grain into 1 cm pieces. Serve with the roasted sweet potato."
    ],
    "tip": "Microwave the sweet potato before roasting to get browned edges without coating it in lots of oil.",
    "kcal": 450,
    "proteinG": 36
  },
  "dish-pork-potato": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced pork",
        "amount": "150 g (lean, about 2 mm thick)"
      },
      {
        "name": "Potato",
        "amount": "150 g (peeled)"
      },
      {
        "name": "Carrot",
        "amount": "60 g"
      },
      {
        "name": "Onion",
        "amount": "60 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Sugar",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "250 ml"
      }
    ],
    "steps": [
      "Spend about 5 minutes cutting the potato into 1.5 cm chunks, the carrot into 5 mm slices and the onion into 1 cm wedges. Cut the pork slices into 4 cm lengths.",
      "Heat the oil in a small deep pan over medium heat. Cook the onion for 2 minutes, until translucent around the edges, then add the pork and stir for 1 minute to separate the slices.",
      "Add the potato, carrot, soy sauce, rice wine, sugar and 250 ml water. Bring to a boil over high heat, about 2 minutes.",
      "Cover and simmer over low heat for 12–15 minutes. Turn the ingredients gently after 7 minutes so the potatoes cook evenly in the broth.",
      "Uncover and cook over medium heat for 2–3 minutes to reduce the sauce to about 3 tbsp. A chopstick should slide easily into the potato, and the pork should reach 71°C.",
      "Add the black pepper and fold gently. Transfer to a shallow bowl without breaking up the potatoes."
    ],
    "tip": "Choose lean pork slices and let the potatoes thicken the sauce naturally instead of adding a starch slurry.",
    "kcal": 465,
    "proteinG": 37
  },
  "dish-beef-potato": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced beef",
        "amount": "150 g (lean, about 2 mm thick)"
      },
      {
        "name": "Potato",
        "amount": "150 g (peeled)"
      },
      {
        "name": "Carrot",
        "amount": "60 g"
      },
      {
        "name": "Onion",
        "amount": "60 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Sugar",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "250 ml"
      }
    ],
    "steps": [
      "Spend about 5 minutes cutting the potato into 1.5 cm chunks, the carrot into 5 mm slices and the onion into wedges. Cut the beef across the grain into 4 cm lengths.",
      "Heat the oil over medium heat. Cook the onion for 2 minutes, then add the potato and carrot and stir for 1 minute.",
      "Add 250 ml water, soy sauce, rice wine and sugar. Bring to a boil over high heat, about 2 minutes, then cover and simmer over low heat for 12 minutes, turning gently once.",
      "When a chopstick can pierce the potato but the pieces still hold their shape, add the beef slices individually. Increase to medium heat, separate the slices gently and simmer for 3 minutes.",
      "Uncover and cook over medium heat for 2 minutes, until the beef reaches 71°C, the potatoes are tender and the broth has thickened slightly. Avoid vigorous stirring.",
      "Stir in the black pepper and serve the beef and vegetables with the sauce."
    ],
    "tip": "Add thinly sliced beef only after the root vegetables are nearly tender to keep cooking time short and the meat tender.",
    "kcal": 475,
    "proteinG": 38
  },
  "dish-egg-potato": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Eggs",
        "amount": "3 large (about 150 g without shells)"
      },
      {
        "name": "Potato",
        "amount": "150 g (peeled)"
      },
      {
        "name": "Onion",
        "amount": "50 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "2 tbsp (30 ml)"
      }
    ],
    "steps": [
      "Spend about 3 minutes slicing the potato into 3 mm rounds and the onion into thin strips. Beat the eggs with the salt and black pepper.",
      "Place the potato in a microwave-safe dish with 30 ml water. Cover with a vented lid and microwave at 800W for 3–4 minutes, until easily pierced with a chopstick. Drain.",
      "Meanwhile, heat the oil in an 18 cm nonstick frying pan over medium heat. Cook the onion for 2 minutes, then add the drained potato and stir for 1 minute.",
      "Spread the vegetables evenly, pour in the eggs and gently shake the pan. Cover and cook over low heat for 5 minutes, until the edges are firm and the top is only slightly moist.",
      "Cover the pan with a large plate, hold it firmly and invert the frittata onto it. Slide it back into the pan, cover and cook over low heat for 2–3 minutes, until the center reaches 71°C with no runny egg.",
      "Turn off the heat and rest for 1 minute. Slide onto a plate, cut into 4 wedges and serve warm."
    ],
    "tip": "Microwave the potato first, then cook the eggs gently in a small pan to make a thick frittata with just 1 tsp oil.",
    "kcal": 400,
    "proteinG": 23
  },
  "dish-chicken-rice": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Chicken breast",
        "amount": "150 g (raw, skinless)"
      },
      {
        "name": "White rice",
        "amount": "60 g uncooked (about 150 g cooked)"
      },
      {
        "name": "Scallion",
        "amount": "15 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Ginger",
        "amount": "5 g"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "90 ml for rice + 400 ml for chicken"
      }
    ],
    "steps": [
      "Rinse and drain the rice, then place in a small heavy-bottomed saucepan with 90 ml water. Bring to a boil over medium heat, about 2 minutes. Cover, cook on the lowest heat for 12 minutes, then turn off the heat and rest for 8 minutes without lifting the lid.",
      "While the rice cooks, thinly slice the washed scallion, separating the white and green parts. Slice the ginger and butterfly the chicken to about 1.5 cm thick. Allow about 3 minutes for this prep.",
      "In another small saucepan, bring 400 ml water, ginger, rice wine and half the salt to a boil over medium heat. Add the chicken, reduce to low heat and poach at a gentle simmer for 8–10 minutes.",
      "Check that the thickest part of the chicken reaches 74°C. Lift it out, reserving the cooking liquid. Rest for 3 minutes, then shred along the grain with two forks.",
      "Heat the oil in a small pan over medium-low heat. Fry the scallion whites for 30 seconds. Add 2 tbsp reserved chicken cooking liquid, the remaining salt and white pepper; simmer for 30 seconds. Turn off the heat and stir in the scallion greens.",
      "Fluff the rice into a bowl, top with the shredded chicken and spoon all the scallion sauce evenly over the top."
    ],
    "tip": "Use the chicken cooking liquid to keep the scallion sauce moist and flavorful without adding rendered chicken fat.",
    "kcal": 450,
    "proteinG": 39
  },
  "dish-ground-pork-rice": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Ground pork",
        "amount": "140 g (about 90% lean)"
      },
      {
        "name": "White rice",
        "amount": "60 g uncooked (about 150 g cooked)"
      },
      {
        "name": "Onion",
        "amount": "100 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Sugar",
        "amount": "1/4 tsp"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "90 ml for rice + 80 ml for sauce"
      }
    ],
    "steps": [
      "Rinse and drain the rice, then place in a small heavy-bottomed saucepan with 90 ml water. Bring to a boil over medium heat, about 2 minutes. Cover, cook on the lowest heat for 12 minutes, then rest off the heat for 8 minutes without lifting the lid.",
      "While the rice cooks, spend about 2 minutes slicing the onion into 5 mm strips. Mix the soy sauce, rice wine, sugar, white pepper and 80 ml water for the sauce.",
      "Heat the oil in a frying pan over medium heat. Cook the onion for 4 minutes, until soft and lightly golden at the edges.",
      "Add the ground pork. Break it into small crumbles with a spatula and cook over medium heat for 3–4 minutes, leaving no large clumps.",
      "Pour in the sauce and bring to a simmer over medium heat. Cover and cook over low heat for 5 minutes, until the pork reaches 71°C. Uncover and reduce over medium heat for 1 minute, leaving about 3 tbsp sauce.",
      "Fluff the rice into a bowl and spoon the pork, onion and sauce over the top."
    ],
    "tip": "Choose about 90% lean ground pork and let slowly cooked onions provide sweetness, keeping added sugar to 1/4 tsp.",
    "kcal": 550,
    "proteinG": 34
  },
  "dish-beef-onion-rice": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced beef",
        "amount": "150 g (lean, about 2 mm thick)"
      },
      {
        "name": "White rice",
        "amount": "60 g uncooked (about 150 g cooked)"
      },
      {
        "name": "Onion",
        "amount": "100 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp (10 ml)"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Sugar",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "90 ml for rice + 70 ml for beef"
      }
    ],
    "steps": [
      "Rinse and drain the rice, then place in a small heavy-bottomed saucepan with 90 ml water. Bring to a boil over medium heat, about 2 minutes. Cover, cook on the lowest heat for 12 minutes, then rest off the heat for 8 minutes without lifting the lid.",
      "While the rice cooks, spend about 3 minutes slicing the onion into 5 mm strips and cutting the beef across the grain into 4 cm lengths.",
      "Heat the oil in a frying pan over medium heat. Cook the onion for 3 minutes, until translucent. Add 70 ml water, soy sauce, rice wine and sugar; cover and simmer over low heat for 3 minutes.",
      "Uncover and increase to medium heat. Lay the beef slices individually in the onion sauce, separate gently and simmer for 2–3 minutes, until the beef reaches 71°C.",
      "Add the black pepper and simmer for 30 seconds, leaving about 3 tbsp sauce rather than cooking the pan dry.",
      "Fluff the rice into a bowl, top with the beef and onions and spoon the pan sauce over them."
    ],
    "tip": "Gently simmer thinly sliced lean beef with onions for a juicy rice topping that needs only 1 tsp oil.",
    "kcal": 550,
    "proteinG": 38
  },
  "dish-chicken-pasta": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Chicken breast",
        "amount": "150 g (raw, skinless)"
      },
      {
        "name": "Pasta",
        "amount": "70 g (dry spaghetti)"
      },
      {
        "name": "Tomato",
        "amount": "200 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Garlic",
        "amount": "5 g"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Dried oregano",
        "amount": "1/4 tsp"
      },
      {
        "name": "Water",
        "amount": "1000 ml for pasta"
      }
    ],
    "steps": [
      "Bring 1000 ml water toward a boil over high heat. Meanwhile, spend about 5 minutes slicing the chicken across the grain into 5 mm pieces, dicing the tomato into 2 cm chunks and mincing the garlic.",
      "Add the pasta to the boiling water. Cook over medium-high heat for 8–10 minutes, following the package time, until just firm in the center. Reserve 80 ml cooking water, then drain.",
      "While the pasta cooks, heat the oil in a frying pan over medium heat. Season the chicken with half the salt and cook for 2 minutes on each side. Transfer to a plate.",
      "Cook the garlic in the same pan over medium-low heat for 20 seconds. Add the tomato, remaining salt and oregano. Cook over medium heat for 3 minutes, crushing half the tomato pieces.",
      "Add the reserved 80 ml pasta water and simmer over low heat for 5 minutes, until saucy. Return the chicken and simmer over medium heat for 2 minutes, until the thickest piece reaches 74°C.",
      "Add the pasta and black pepper. Toss over medium heat for 1–2 minutes, until the sauce coats the noodles and no watery puddle remains in the pan."
    ],
    "tip": "Use the starch in pasta water to help the tomato sauce cling to the noodles without adding butter.",
    "kcal": 535,
    "proteinG": 44
  },
  "dish-ground-pork-pasta": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Ground pork",
        "amount": "140 g (about 90% lean)"
      },
      {
        "name": "Pasta",
        "amount": "70 g (dry spaghetti)"
      },
      {
        "name": "Tomato",
        "amount": "200 g"
      },
      {
        "name": "Onion",
        "amount": "50 g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp (5 ml)"
      },
      {
        "name": "Garlic",
        "amount": "5 g"
      },
      {
        "name": "Salt",
        "amount": "1/4 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Dried oregano",
        "amount": "1/4 tsp"
      },
      {
        "name": "Water",
        "amount": "1000 ml for pasta"
      }
    ],
    "steps": [
      "Heat 1000 ml water over high heat. Meanwhile, spend about 5 minutes cutting the tomato into 1 cm dice, finely dicing the onion and mincing the garlic.",
      "Add the pasta to the boiling water. Cook over medium-high heat for 8–10 minutes, following the package time, until just firm to the bite. Reserve 100 ml cooking water and drain.",
      "While the pasta cooks, heat the oil in a frying pan over medium heat. Cook the onion for 2 minutes, then add the garlic for 20 seconds.",
      "Add the ground pork and cook over medium heat for 4 minutes, breaking it into small crumbles. Add the tomato, salt, black pepper and oregano; cook for 2 minutes to release the tomato juices.",
      "Pour in the reserved 100 ml pasta water. Cover and simmer over low heat for 8 minutes, checking that the pork reaches 71°C. Uncover and crush any large tomato pieces with the spatula.",
      "Add the cooked pasta and toss over medium heat for 1–2 minutes, until the sauce thickens and the pork coats the noodles evenly."
    ],
    "tip": "Finely diced tomatoes and gently cooked onions sweeten the sauce naturally, without added sugar or extra oil.",
    "kcal": 590,
    "proteinG": 39
  },
  "dish-beef-pasta": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced beef",
        "amount": "140g lean beef, about 2mm thick"
      },
      {
        "name": "Pasta",
        "amount": "70g dry"
      },
      {
        "name": "Bell peppers",
        "amount": "150g (75g each red and yellow)"
      },
      {
        "name": "Onion",
        "amount": "50g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp"
      },
      {
        "name": "Garlic",
        "amount": "5g (about 1 clove)"
      },
      {
        "name": "Soy sauce",
        "amount": "1 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp"
      },
      {
        "name": "Salt",
        "amount": "1/8 tsp"
      },
      {
        "name": "Black pepper",
        "amount": "1/4 tsp"
      },
      {
        "name": "Water",
        "amount": "1000ml for pasta; reserve 80ml cooking water"
      }
    ],
    "steps": [
      "Bring 1000ml water to a boil. Meanwhile, spend about 5 minutes removing the pepper seeds and cutting the peppers into 1cm strips, slicing the onion into 5mm strips, mincing the garlic, and cutting the beef into 4cm lengths.",
      "Add the pasta to the boiling water and cook over medium heat for 8–10 minutes, following the package timing. Drain when the center has only a tiny pale dot, reserving 80ml cooking water. Start the next step while the pasta cooks.",
      "Heat 1 tsp oil in a nonstick pan over medium heat for 30 seconds. Spread out the beef, sear for 1 minute, flip, and cook for 30 seconds. Transfer to a plate; it will finish cooking later.",
      "In the same pan, stir-fry the onion over medium heat for 2 minutes. Add the garlic for 20 seconds, then the peppers for 2 minutes. Add the reserved 80ml pasta water, soy sauce, rice wine, salt, and black pepper; bring to a boil.",
      "Return the beef and add the drained pasta. Toss over medium heat for 2–3 minutes, until the beef reaches 71°C, the peppers are lightly crisp, and the pasta is coated with sauce.",
      "Turn the heat to high and toss for another 30 seconds, leaving about 1 tbsp sauce in the pan. Turn off the heat and serve promptly so the beef stays tender."
    ],
    "tip": "Choose lean beef and weigh the dry pasta; peppers and onions add volume without needing extra noodles.",
    "kcal": 585,
    "proteinG": 40
  },
  "dish-egg-noodle": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Eggs",
        "amount": "2 (about 100g without shells)"
      },
      {
        "name": "Wheat noodles",
        "amount": "150g refrigerated fresh, uncooked noodles"
      },
      {
        "name": "Scallions",
        "amount": "15g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "2 tsp"
      },
      {
        "name": "Soy sauce",
        "amount": "1 tsp"
      },
      {
        "name": "Salt",
        "amount": "1/8 tsp"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "1000ml for boiling noodles + 30ml for stir-frying"
      }
    ],
    "steps": [
      "Bring 1000ml water to a boil. Meanwhile, take about 3 minutes to cut the scallions into 3cm lengths, separating the white and green parts. Beat the eggs with the salt for 30 seconds.",
      "Add the fresh noodles to the boiling water and cook over medium heat for about 3–4 minutes, or 1 minute less than the package time. Drain when flexible but still slightly firm in the center.",
      "Heat 1 tsp oil in a nonstick pan over medium heat for 30 seconds. Pour in the eggs, wait 15 seconds, then gently push them into broad curds. Cook for about 45 seconds more, until set, and transfer to a plate.",
      "Add the remaining 1 tsp oil to the pan and stir-fry the scallion whites over medium heat for 20 seconds. Add the noodles, soy sauce, and 30ml water; toss over medium-high heat for 1 minute to separate and coat the strands.",
      "Return the eggs and add the scallion greens and white pepper. Toss over medium heat for 1–2 minutes, until the noodles are cooked through, no liquid egg remains, and the pan has no pooled liquid. Turn off the heat and serve."
    ],
    "tip": "Remove the eggs while you fry the noodles, then add them back to keep them tender without adding more oil.",
    "kcal": 455,
    "proteinG": 21
  },
  "dish-chicken-bokchoy-rice": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Chicken breast",
        "amount": "150g raw, skinless"
      },
      {
        "name": "Bok choy",
        "amount": "200g"
      },
      {
        "name": "White rice",
        "amount": "60g uncooked (about 150g cooked)"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp"
      },
      {
        "name": "Garlic",
        "amount": "5g (about 1 clove)"
      },
      {
        "name": "Soy sauce",
        "amount": "1 tsp"
      },
      {
        "name": "Potato starch",
        "amount": "1 tsp (3g)"
      },
      {
        "name": "Salt",
        "amount": "1/8 tsp"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "90ml for rice + 10ml for marinating + 30ml for vegetables"
      }
    ],
    "steps": [
      "Rinse and drain the rice. Put it in a small saucepan with 90ml water and bring to a boil over medium heat, about 2 minutes. Cover, cook over the lowest heat for 12 minutes, then turn off the heat and rest, covered, for 8 minutes. Prepare and stir-fry the toppings while the rice cooks.",
      "Take about 4 minutes to slice the chicken across the grain into 5mm slices. Separate and wash the bok choy; cut stems into 2cm lengths and leaves into 4cm pieces. Mince the garlic. Mix the chicken with the soy sauce, potato starch, and 10ml water; marinate for 5 minutes.",
      "Heat 1 tsp oil in a nonstick pan over medium heat for 30 seconds. Spread out the chicken and sear for 2 minutes, flip, and cook for 1 minute. Transfer to a plate.",
      "Add the garlic to the same pan and stir over medium heat for 15 seconds. Add the bok choy stems and 30ml water, cover, and cook for 1 minute. Add the leaves, salt, and white pepper and stir-fry for 1 minute.",
      "Return the chicken and toss over medium heat for 1–2 minutes, until it reaches 74°C. The leaves should be wilted, the stems tender with a little bite, and the sauce slightly thickened. Turn off the heat.",
      "Fluff the rested rice and check that the grains have no hard centers. Spoon into a bowl and top with the chicken, bok choy, and pan juices."
    ],
    "tip": "Marinate the chicken with starch and water, and cook the bok choy stems before the leaves for tender results with less oil.",
    "kcal": 470,
    "proteinG": 41
  },
  "dish-pork-carrot-rice": {
    "servings": 1,
    "ingredients": [
      {
        "name": "Sliced pork",
        "amount": "150g lean pork, about 2mm thick"
      },
      {
        "name": "Carrot",
        "amount": "100g"
      },
      {
        "name": "White rice",
        "amount": "60g uncooked (about 150g cooked)"
      },
      {
        "name": "Onion",
        "amount": "50g"
      },
      {
        "name": "Scallions",
        "amount": "10g"
      }
    ],
    "seasonings": [
      {
        "name": "Cooking oil",
        "amount": "1 tsp"
      },
      {
        "name": "Soy sauce",
        "amount": "2 tsp"
      },
      {
        "name": "Rice wine",
        "amount": "1 tsp"
      },
      {
        "name": "Potato starch",
        "amount": "1 tsp (3g)"
      },
      {
        "name": "White pepper",
        "amount": "1/8 tsp"
      },
      {
        "name": "Water",
        "amount": "90ml for rice + 10ml for marinating + 50ml for vegetables"
      }
    ],
    "steps": [
      "Rinse and drain the rice. Put it in a small saucepan with 90ml water and bring to a boil over medium heat, about 2 minutes. Cover, cook over the lowest heat for 12 minutes, then turn off the heat and rest, covered, for 8 minutes. Prepare and cook the topping at the same time.",
      "Take about 5 minutes to cut the carrot diagonally into 2mm slices, the onion into 5mm strips, and the scallions into thin rounds. Cut the pork into 4cm lengths. Mix the pork with 1 tsp soy sauce, the rice wine, potato starch, and 10ml water; marinate for 5 minutes.",
      "Heat 1 tsp oil in a nonstick pan over medium heat for 30 seconds. Spread out the pork, sear for 1 minute, then flip and stir-fry for 1 minute. Transfer to a plate.",
      "Stir-fry the onion and carrot in the same pan over medium heat for 2 minutes. Add 50ml water and the remaining 1 tsp soy sauce, cover, and cook over medium-low heat for 3 minutes, until a chopstick can pierce the carrot.",
      "Return the pork and add the white pepper. Toss over medium heat for 2–3 minutes, until the pork reaches 71°C and the sauce lightly coats the ingredients. Add the scallions, stir for 20 seconds, and turn off the heat.",
      "Fluff the rested rice and check that the grains have no hard centers. Spoon into a bowl, arrange the carrot, onion, and pork on top, and spoon over the pan juices."
    ],
    "tip": "Thinly slice the carrot and steam it briefly with water to soften it quickly without needing extra oil.",
    "kcal": 555,
    "proteinG": 39
  },
  'dish-beef-pepper-rice': {
    servings: 1,
    ingredients: [{ name: 'Sliced beef', amount: '130 g (lean, 2 mm thick)' }, { name: 'Bell peppers', amount: '150 g (half red, half yellow)' }, { name: 'White rice', amount: '60 g (uncooked)' }, { name: 'Onion', amount: '50 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '2 tsp (10 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '120 ml (90 ml for rice, 30 ml for stir-frying)' }],
    steps: [
      'Rinse and drain the rice, then put it in a small, heavy-bottomed saucepan with 90 ml water. Bring to a boil over medium heat, about 2 minutes. Cover tightly, cook over the lowest heat for 12 minutes, then turn off the heat and rest for 8 minutes without lifting the lid.',
      'Prepare the toppings while the rice cooks. Deseed the peppers and cut into 1 cm strips; slice the onion 5 mm thick. Cut the beef across the grain into 5 cm pieces and marinate with 1 tsp soy sauce, the rice wine and potato starch for 5 minutes.',
      'Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the beef, sear for 45 seconds, then stir-fry for 45 seconds. Transfer to a clean plate; it will finish cooking later.',
      'Add the onion to the same pan and stir-fry over medium heat for 1 minute. Add the peppers and cook for 2 minutes, until their edges soften but the strips still hold their shape.',
      'Add the remaining 1 tsp soy sauce, the black pepper and 30 ml water. Return the beef and stir-fry over medium heat for 2–3 minutes, until the thickest slice reaches 71°C and the sauce lightly coats the ingredients.',
      'Uncover and fluff the rested rice, checking that the grains have no hard center. Spoon into a bowl, top with the beef, peppers and onion, and serve immediately.',
    ],
    tip: 'Weigh out 60 g uncooked rice and cook the toppings while it steams. Measuring first makes portions easier to manage than filling a large bowl by eye.',
    kcal: 535, proteinG: 34,
  },
  'dish-chicken-baby-corn': {
    servings: 1,
    ingredients: [{ name: 'Chicken breast', amount: '150 g (skinless)' }, { name: 'Baby corn', amount: '150 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/4 tsp' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Potato starch', amount: '1 tsp' }, { name: 'Water', amount: '40 ml' }],
    steps: [
      'Slice the chicken across the grain into 5 mm pieces. Halve any thick baby corn lengthwise, then cut diagonally into 3 cm lengths. Thinly slice the garlic; allow about 4 minutes for preparation.',
      'Massage the chicken with the rice wine, potato starch, white pepper, 1/8 tsp salt and 10 ml water until the water is absorbed. Marinate for 3 minutes.',
      'Preheat a nonstick pan over medium heat for 30 seconds. Add all the oil and cook the garlic for 20 seconds, until fragrant but not browned.',
      'Spread out the chicken and sear over medium heat for 1 minute, then stir-fry for 1 minute. Add the baby corn and stir-fry for 30 seconds.',
      'Add the remaining 30 ml water and 1/8 tsp salt. Cover and cook over medium-low heat for 3 minutes to soften the center of the corn.',
      'Uncover and cook over medium heat for 1 minute to reduce excess liquid. Check that the thickest chicken slice reaches 74°C and the baby corn can be broken with chopsticks, then serve.',
    ],
    tip: 'Marinating chicken breast with water and starch, then briefly covering the pan, helps keep it tender with just 1 tsp oil.',
    kcal: 300, proteinG: 38,
  },
  'dish-ground-pork-cabbage': {
    servings: 1,
    ingredients: [{ name: 'Ground pork', amount: '130 g (about 90% lean)' }, { name: 'Cabbage', amount: '200 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '30 ml' }],
    steps: [
      'Wash and drain the cabbage. Cut the leaves into 4 cm pieces and slice the thick ribs diagonally, 3 mm thick. Mince the garlic; allow about 4 minutes for preparation.',
      'Preheat a wok over medium heat for 30 seconds. Add all the oil and the garlic, and cook for 20 seconds until fragrant.',
      'Add the ground pork and stir-fry over medium heat for 3 minutes, breaking it into small crumbles with a spatula. Pour the rice wine around the edge of the wok and cook for another 30 seconds.',
      'Add the thick cabbage ribs first and stir-fry for 1 minute. Add the leaves, soy sauce, salt, white pepper and 30 ml water, and toss well.',
      'Cover and cook over medium-low heat for 2 minutes. Uncover and stir-fry over medium-high heat for 1–2 minutes, until the leaves soften and no liquid pools in the wok.',
      'Gather the larger pork crumbles together and check that their centers reach 71°C. The cabbage ribs should be tender enough to bite through with some crunch remaining; turn off the heat and serve.',
    ],
    tip: 'Use lean ground pork and add the cabbage ribs before the leaves to bring out sweetness and texture without extra oil.',
    kcal: 340, proteinG: 29,
  },
  'dish-pork-zucchini': {
    servings: 1,
    ingredients: [{ name: 'Sliced pork', amount: '130 g (lean, 3 mm thick)' }, { name: 'Zucchini', amount: '200 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '20 ml' }],
    steps: [
      'Wash and halve the zucchini lengthwise, then cut into 5 mm half-moons. Thinly slice the garlic and cut the pork into 4 cm pieces; allow about 4 minutes for preparation.',
      'Mix the pork with the soy sauce, rice wine and potato starch, and marinate for 3 minutes. Meanwhile, pat the zucchini dry with paper towels.',
      'Preheat a nonstick pan over medium heat for 30 seconds and add 1/2 tsp oil. Spread out the pork, sear for 1 minute, then turn and sear for another 1 minute before transferring to a plate.',
      'Add the remaining 1/2 tsp oil and the garlic to the pan. Cook for 20 seconds, then add the zucchini and stir-fry over medium-high heat for 2 minutes until lightly golden on the cut sides.',
      'Return the pork, add the salt, black pepper and 20 ml water, and stir-fry over medium heat for 2 minutes. The zucchini edges should turn translucent while the centers retain some bite.',
      'Check that the thickest pork slice reaches 71°C. If liquid remains in the pan, cook over medium-high heat for another 30 seconds until the sauce clings to the ingredients, then serve.',
    ],
    tip: 'Dry the zucchini before cooking and add salt near the end. This limits excess moisture so it can brown without extra oil.',
    kcal: 285, proteinG: 31,
  },
  'dish-beef-spinach': {
    servings: 1,
    ingredients: [{ name: 'Sliced beef', amount: '130 g (lean, 2 mm thick)' }, { name: 'Spinach', amount: '200 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '20 ml' }],
    steps: [
      'Wash all grit from the spinach, especially near the roots. Cut into 5 cm lengths, keeping stems and leaves separate. Slice the garlic and cut the beef across the grain into 5 cm pieces; allow about 5 minutes for preparation.',
      'Mix the beef with the soy sauce, rice wine, potato starch and white pepper, and marinate for 3 minutes. Shake the spinach thoroughly dry in a colander.',
      'Preheat a wok over medium heat for 30 seconds. Add all the oil and the garlic, cook for 20 seconds, then add the beef and stir-fry for 2 minutes.',
      'Add the spinach stems and 20 ml water, and stir-fry over medium-high heat for 1 minute. Add the leaves in two batches, tossing until they wilt.',
      'Add the salt and cook over medium heat for another 1–2 minutes. Check that the thickest beef slice reaches 71°C and the spinach stems are tender while the leaves remain green.',
      'Toss over high heat for 20 seconds. When only a thin layer of juices remains, turn off the heat and serve with the garlic slices.',
    ],
    tip: 'Drain spinach well and cook the stems first to shorten cooking time and preserve texture without an extra drizzle of oil.',
    kcal: 310, proteinG: 32,
  },
  'dish-chicken-carrot': {
    servings: 1,
    ingredients: [{ name: 'Chicken breast', amount: '150 g (skinless)' }, { name: 'Carrot', amount: '150 g' }, { name: 'Onion', amount: '80 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/4 tsp' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1 tsp' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '50 ml' }],
    steps: [
      'Peel the carrot and cut diagonally into 2 mm slices. Slice the onion 5 mm thick and cut the chicken across the grain into 5 mm strips; allow about 4 minutes for preparation.',
      'Massage the chicken with the rice wine, potato starch, white pepper, 1/8 tsp salt and 10 ml water. Leave to marinate for 3 minutes.',
      'Heat a nonstick pan over medium heat for 30 seconds. Add all the oil and the onion, and stir-fry for 1 minute until translucent at the edges.',
      'Add the carrot and the remaining 40 ml water. Cover and cook over medium-low heat for 3 minutes, then check that the carrot slices bend easily.',
      'Push the vegetables to the side and spread the chicken in the center. Sear over medium heat for 1 minute, then turn. Add the remaining 1/8 tsp salt and stir-fry with the vegetables for 2 minutes.',
      'Check that the thickest chicken strip reaches 74°C and the carrots are tender but intact. Toss over medium-high heat for 30 seconds to reduce the sauce, then serve.',
    ],
    tip: 'Slice carrots thinly and steam them with measured water to use less oil. The onion adds sweetness without extra sugar.',
    kcal: 330, proteinG: 37,
  },
  'dish-pork-tomato': {
    servings: 1,
    ingredients: [{ name: 'Sliced pork', amount: '130 g (lean, 3 mm thick)' }, { name: 'Tomato', amount: '1 (about 200 g)' }, { name: 'Onion', amount: '70 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Sugar', amount: '1/4 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Water', amount: '40 ml' }],
    steps: [
      'Core the tomato and cut into 8 wedges. Slice the onion 5 mm thick and cut the pork into 4 cm pieces; allow about 4 minutes for preparation.',
      'Mix the pork with the soy sauce, rice wine and potato starch, and marinate for 3 minutes. Preheat a nonstick pan over medium heat for 30 seconds.',
      'Add all the oil and spread out the pork. Sear for 1 minute, then stir-fry for 1 minute and transfer to a plate.',
      'Stir-fry the onion in the same pan for 1 minute, then add the tomato and cook for 1 minute. Add 40 ml water, the sugar and salt. Cover and cook over medium-low heat for 2 minutes.',
      'Uncover and gently crush two tomato wedges to release their juices into the sauce. Return the pork and cook, stirring, over medium heat for 2 minutes.',
      'Check that the thickest pork slice reaches 71°C and the tomato edges are soft while the wedges still hold their shape. Toss through the sauce, turn off the heat and serve.',
    ],
    tip: 'Use the cooked tomato juices as the sauce, with just 1/4 tsp sugar to balance the acidity, instead of adding a sugary bottled sauce.',
    kcal: 310, proteinG: 31,
  },
  'dish-beef-cucumber': {
    servings: 1,
    ingredients: [{ name: 'Sliced beef', amount: '130 g (lean, 2 mm thick)' }, { name: 'Small cucumbers', amount: '2 (about 180 g)' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '15 ml' }],
    steps: [
      'Wash and trim the cucumbers, then slice diagonally, 4 mm thick. Slice the garlic and cut the beef across the grain into 4 cm pieces; allow about 3 minutes for preparation.',
      'Mix the beef with the soy sauce, rice wine and potato starch, and marinate for 2 minutes. Measure out the salt and black pepper so they are ready to add.',
      'Preheat a wok over medium heat for 30 seconds. Add all the oil and the garlic and cook for 20 seconds. Spread out the beef, sear for 1 minute, then stir-fry for 1 minute.',
      'Add the cucumber and stir-fry over medium-high heat for 1 minute. Add 15 ml water, the salt and black pepper, and cook for another 1–2 minutes.',
      'Check that the thickest beef slice reaches 71°C and the cucumber edges are translucent while their centers remain crisp. Toss over high heat for 20 seconds to reduce the liquid, then serve without covering the pan again.',
    ],
    tip: 'Add cucumber last and cook it quickly to keep its crunch. Its generous volume pairs well with lean beef without extra sauce or oil.',
    kcal: 290, proteinG: 29,
  },
  'dish-egg-tomato-noodle': {
    servings: 1,
    ingredients: [{ name: 'Eggs', amount: '2 (about 100 g without shells)' }, { name: 'Tomato', amount: '1 (about 200 g)' }, { name: 'Wheat noodles', amount: '70 g (dry; about 180 g cooked)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/4 tsp' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '1100 ml (700 ml for noodles, 400 ml for soup)' }],
    steps: [
      'Bring 700 ml water to a boil over high heat for the noodles. Meanwhile, core the tomato and cut into 8 wedges. Beat the eggs with 1/8 tsp salt; allow about 4 minutes for preparation.',
      'Add the dry noodles to the boiling water and maintain a steady boil over medium heat. Cook according to the package, about 5–7 minutes, until the centers are just cooked. Drain and place in a soup bowl.',
      'While the noodles cook, heat all the oil in another saucepan over medium heat and pour in the eggs. Wait 15 seconds, then push into large curds with a spatula. Cook for about 45 seconds until the surfaces set, then transfer to a plate.',
      'Add the tomato to the same saucepan and cook over medium heat for 2 minutes, gently crushing two wedges to release their juices. Add 400 ml water, the soy sauce, white pepper and remaining 1/8 tsp salt.',
      'Bring to a boil over high heat, then simmer over medium-low heat for 3 minutes until the broth turns orange-red. Return the eggs and cook for 1 minute, until the curds are fully set with no runny egg remaining.',
      'Pour the tomato, eggs and hot broth over the noodles. Gently loosen the noodles and serve before they soften too much in the soup.',
    ],
    tip: 'Weigh out 70 g dry noodles, then add two eggs and a whole tomato for protein and satisfying volume instead of increasing the noodle portion.',
    kcal: 480, proteinG: 21,
  },
  'dish-chicken-spinach-pasta': {
    servings: 1,
    ingredients: [{ name: 'Chicken breast', amount: '150 g (skinless)' }, { name: 'Spinach', amount: '150 g' }, { name: 'Pasta', amount: '70 g (dry)' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Olive oil', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/2 tsp for pasta water + 1/8 tsp for chicken' }, { name: 'Black pepper', amount: '1/4 tsp' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Water', amount: '1000 ml (for pasta; reserve 60 ml)' }],
    steps: [
      'Bring 1000 ml water and 1/2 tsp salt to a boil over high heat. Meanwhile, wash the spinach and cut into 5 cm lengths, thinly slice the garlic, and slice the chicken across the grain, 5 mm thick. Allow about 5 minutes for preparation.',
      'Mix the chicken with the rice wine, 1/8 tsp salt and 1/8 tsp black pepper, and leave for 5 minutes. Add the pasta to the boiling water and cook over medium heat until 1 minute short of the package time, about 8–10 minutes.',
      'While the pasta cooks, heat a nonstick pan over medium heat. Add all the olive oil and the garlic and cook for 30 seconds. Add the chicken as soon as the garlic turns pale gold.',
      'Spread out the chicken and sear for 2 minutes, then turn and cook for another 2 minutes. Add the spinach stems and cook for 30 seconds, then add the leaves and stir-fry for 1 minute.',
      'Reserve 60 ml pasta water, then drain the pasta. Add both the pasta and reserved water to the chicken pan, and toss over medium heat for 1–2 minutes until the starchy liquid lightly coats the pasta.',
      'Check that the thickest chicken slice reaches 74°C and the pasta has no hard, raw center. Add the remaining 1/8 tsp black pepper, toss for 20 seconds and serve.',
    ],
    tip: 'Starchy pasta water helps emulsify just 1 tsp olive oil into a silky coating, so butter or cream is unnecessary.',
    kcal: 530, proteinG: 46,
  },
  'dish-ground-pork-potato': {
    servings: 1,
    ingredients: [{ name: 'Ground pork', amount: '130 g (about 90% lean)' }, { name: 'Potato', amount: '200 g (peeled weight)' }, { name: 'Onion', amount: '60 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '2 tsp (10 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Water', amount: '100 ml' }],
    steps: [
      'Peel and cut the potato into 1.5 cm cubes. Rinse off the surface starch and drain. Cut the onion into 1 cm pieces; allow about 5 minutes for preparation.',
      'Preheat a nonstick pan over medium heat for 30 seconds. Add all the oil and spread the potato cubes in the pan. Sear for 3 minutes, turning once.',
      'Add 80 ml water, cover and cook over medium-low heat for 7–8 minutes, until a chopstick can pierce the center of a potato cube. Transfer the potatoes to a plate.',
      'Add the ground pork to the same pan. Cook over medium heat for 3 minutes, breaking it into crumbles, then add the onion and cook for 2 minutes until translucent at the edges.',
      'Pour the rice wine around the edge of the pan. Add the soy sauce, black pepper, salt and remaining 20 ml water. Return the potatoes and gently toss for 1 minute.',
      'Cover and cook over medium-low heat for 2 minutes. Check that the pork crumbles reach 71°C and the potatoes are fully tender. Uncover and reduce the sauce over medium-high heat for 1 minute, keeping the potato cubes intact.',
    ],
    tip: 'Steam the potatoes with measured water before combining with the pork instead of deep-frying. The potatoes provide the starch for this meal, so extra rice is optional.',
    kcal: 470, proteinG: 32,
  },
  'dish-beef-zucchini': {
    servings: 1,
    ingredients: [{ name: 'Sliced beef', amount: '130 g (lean, 2 mm thick)' }, { name: 'Zucchini', amount: '200 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1/2 tsp' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Water', amount: '20 ml' }],
    steps: [
      'Wash and halve the zucchini lengthwise, then cut into 6 mm half-moons and pat dry. Slice the garlic and cut the beef across the grain into 4 cm pieces; allow about 4 minutes for preparation.',
      'Mix the beef with the soy sauce, rice wine and potato starch, and marinate for 3 minutes. Preheat a nonstick pan over medium heat for 30 seconds.',
      'Add 1/2 tsp oil and spread out the beef. Sear for 45 seconds, then stir-fry for 45 seconds. Transfer the beef to a plate, leaving the juices in the pan.',
      'Add the remaining 1/2 tsp oil and the garlic to the pan and cook for 20 seconds. Add the zucchini and stir-fry over medium-high heat for 3 minutes until lightly golden in places on both sides.',
      'Return the beef and add 20 ml water, the salt and black pepper. Stir-fry over medium heat for 2 minutes, until the thickest beef slice reaches 71°C.',
      'Check that the zucchini edges are tender and the centers still have some spring. Toss over high heat for 20 seconds to evaporate excess moisture, then turn off the heat.',
    ],
    tip: 'Set the beef aside while the zucchini cooks, then return it at the end. This avoids overcooking the meat without adding extra oil for tenderness.',
    kcal: 290, proteinG: 31,
  },
  'dish-tenderloin-pepper': {
    servings: 1,
    ingredients: [{ name: 'Pork loin', amount: '150 g (visible fat trimmed)' }, { name: 'Bell peppers', amount: '150 g (half red, half yellow)' }, { name: 'Onion', amount: '70 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '1 tsp (5 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Potato starch', amount: '1 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '30 ml' }],
    steps: [
      'Slice the pork loin across the grain, 3 mm thick. Deseed the peppers and cut into 1 cm strips; slice the onion 5 mm thick. Allow about 5 minutes for preparation.',
      'Massage the pork with the soy sauce, rice wine, potato starch, white pepper and 10 ml water, then marinate for 5 minutes.',
      'Preheat a nonstick pan over medium heat for 30 seconds and add all the oil. Spread out the pork, sear for 1 minute, then stir-fry for 1 minute and transfer to a plate.',
      'Stir-fry the onion in the same pan for 1 minute. Add the peppers, salt and remaining 20 ml water. Cover and cook over medium-low heat for 1 minute.',
      'Uncover, return the pork and stir-fry over medium heat for 2 minutes, allowing the starch in the marinade to thicken the sauce slightly.',
      'Check that the thickest pork slice reaches 71°C and the peppers are cooked but still hold their shape. Toss over medium-high heat for 30 seconds to reduce the sauce, then serve immediately to avoid overcooking the lean pork.',
    ],
    tip: 'Thinly sliced pork loin marinated with 1 tsp starch stays tender with less oil, without relying on a fattier cut.',
    kcal: 315, proteinG: 36,
  },
  'dish-chicken-thigh-cabbage': {
    servings: 1,
    ingredients: [{ name: 'Boneless chicken thigh', amount: '150 g (skin removed and visible fat trimmed)' }, { name: 'Cabbage', amount: '200 g' }, { name: 'Garlic', amount: '2 cloves (about 6 g)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Salt', amount: '1/4 tsp' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'Black pepper', amount: '1/8 tsp' }, { name: 'Water', amount: '40 ml' }],
    steps: [
      'Remove the chicken skin and cut into 2 cm pieces, slicing any thick parts so they are no thicker than 1 cm. Cut cabbage leaves into 4 cm pieces and thick ribs into 3 mm slices. Slice the garlic; allow about 5 minutes for preparation.',
      'Mix the chicken with the rice wine, black pepper and 1/8 tsp salt, and leave for 3 minutes. Preheat a nonstick pan over medium heat for 30 seconds.',
      'Add all the oil and spread out the chicken. Sear for 3 minutes, then turn and cook for 2 minutes until golden on the surface.',
      'Add the garlic and thick cabbage ribs and stir-fry over medium heat for 1 minute. Add the leaves, remaining 1/8 tsp salt and 40 ml water, and toss well.',
      'Cover and cook over medium-low heat for 3 minutes to soften the leaves. Uncover and check that the thickest chicken piece reaches 74°C.',
      'Check that the cabbage ribs are tender, then stir-fry over medium-high heat for 1 minute until excess liquid has evaporated and the chicken is coated in the cabbage juices. Serve immediately.',
    ],
    tip: 'Remove the chicken skin and visible fat before searing in a nonstick pan to keep the meat juicy while reducing the fat in the meal.',
    kcal: 335, proteinG: 32,
  },
  'dish-beef-bokchoy-noodle': {
    servings: 1,
    ingredients: [{ name: 'Sliced beef', amount: '130 g (lean, 2 mm thick)' }, { name: 'Bok choy', amount: '150 g' }, { name: 'Wheat noodles', amount: '70 g (dry; about 180 g cooked)' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Ginger', amount: '3 g (cut into 3 slices)' }, { name: 'Soy sauce', amount: '2 tsp (10 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Salt', amount: '1/8 tsp' }, { name: 'Water', amount: '1100 ml (700 ml for noodles, 400 ml for soup)' }],
    steps: [
      'Bring 700 ml water to a boil over high heat for the noodles. Meanwhile, trim the bok choy and wash each leaf, halving larger pieces lengthwise. Cut the beef across the grain into 5 cm pieces and thinly slice the ginger; allow about 5 minutes for preparation.',
      'Mix the beef with 1 tsp soy sauce and the rice wine, and leave for 3 minutes. Add the dry noodles to the boiling water and cook over medium heat for about 5–7 minutes, following the package time until their centers are cooked.',
      'In another saucepan, heat all the oil and ginger over medium heat for 30 seconds. Add 400 ml water, the remaining 1 tsp soy sauce, salt and white pepper.',
      'Bring the broth to a boil over high heat, then reduce to medium. Add the bok choy stems and cook for 1 minute, then add the leaves and cook for 1 minute. Once the stems are tender, transfer the greens to a soup bowl.',
      'Add the beef and its marinade to the gently bubbling broth, separating the slices. Cook over medium heat for 2–3 minutes, until the thickest slice reaches 71°C.',
      'Drain the noodles and add to the bowl with the beef, ginger and hot broth. Arrange the bok choy on top. Avoid leaving the noodles in the saucepan, where they will continue absorbing the soup.',
    ],
    tip: 'Cook the noodles and broth separately for easier portioning. Ginger and measured soy sauce add flavor; there is no need to finish every drop of broth.',
    kcal: 520, proteinG: 36,
  },
  'dish-chicken-pepper-noodle': {
    servings: 1,
    ingredients: [{ name: 'Chicken breast', amount: '130 g (skinless)' }, { name: 'Bell peppers', amount: '150 g (half red, half yellow)' }, { name: 'Wheat noodles', amount: '70 g (dry; about 180 g cooked)' }, { name: 'Onion', amount: '50 g' }],
    seasonings: [{ name: 'Cooking oil', amount: '1 tsp (5 ml)' }, { name: 'Soy sauce', amount: '2 tsp (10 ml)' }, { name: 'Rice wine', amount: '1 tsp (5 ml)' }, { name: 'White pepper', amount: '1/8 tsp' }, { name: 'Sugar', amount: '1/4 tsp' }, { name: 'Water', amount: '1000 ml (300 ml for chicken, 700 ml for noodles; reserve 40 ml noodle water)' }],
    steps: [
      'Slice the chicken breast horizontally into pieces no thicker than 1 cm. Deseed the peppers and cut into 5 mm strips; slice the onion 3 mm thick. Allow about 4 minutes for preparation.',
      'Bring 300 ml water and the rice wine to a boil over medium heat in a small saucepan. Add the chicken and simmer gently over low heat for 5–6 minutes, until its thickest part reaches 74°C. Remove, cool for 1 minute, then shred along the grain.',
      'While the chicken poaches, bring 700 ml water to a boil over high heat in another saucepan. Add the dry noodles and cook until 1 minute short of the package time, about 4–6 minutes. Reserve 40 ml noodle water, then drain.',
      'Heat all the oil in a wok over medium heat. Stir-fry the onion for 1 minute, add the peppers and cook for 2 minutes until slightly softened but still brightly colored.',
      'Add the soy sauce, white pepper, sugar and reserved 40 ml noodle water, followed by the noodles and shredded chicken. Toss with chopsticks and a spatula over medium heat for 2 minutes.',
      'Check that the noodles have no hard center and the chicken is hot throughout. Toss over medium-high heat for 30 seconds, until the sauce coats everything with no liquid pooling in the wok, then serve.',
    ],
    tip: 'Poaching and shredding the chicken helps distribute it evenly through the noodles. Peppers and onion add satisfying volume while keeping the noodle portion measured.',
    kcal: 525, proteinG: 39,
  },
};

Object.assign(strings, {
  'recipe.servings': { 'zh-Hant': '{count} 人份', en: 'Serves {count}' },
  'recipe.energy': { 'zh-Hant': '約 {count} kcal（估算）', en: '~{count} kcal (estimate)' },
  'recipe.protein': { 'zh-Hant': '蛋白質 {count} g（估算）', en: '{count} g protein (estimate)' },
  'recipe.ingredients': { 'zh-Hant': '食材', en: 'Ingredients' },
  'recipe.seasonings': { 'zh-Hant': '調味料', en: 'Seasonings' },
  'recipe.steps': { 'zh-Hant': '步驟', en: 'Method' },
  'recipe.tip': { 'zh-Hant': '小提醒', en: 'Cooking Tip' },
  'recipe.missing': { 'zh-Hant': '這道菜還沒有食譜', en: 'There is no recipe for this dish yet.' },
  'recipe.tutorials': { 'zh-Hant': '看教學', en: 'Cooking Tutorials' },
  'recipe.youtube': { 'zh-Hant': 'YouTube', en: 'YouTube' },
  'recipe.bilibili': { 'zh-Hant': 'Bilibili', en: 'Bilibili' },
  'recipe.icook': { 'zh-Hant': '愛料理', en: 'iCook' },
  'recipe.google': { 'zh-Hant': 'Google 食譜', en: 'Google Recipes' },
  'recipe.searchMethod': { 'zh-Hant': '{name} 做法', en: '{name} recipe' },
  'recipe.searchRecipe': { 'zh-Hant': '{name} 食譜', en: '{name} recipe' },
  'recipe.chineseMethod': { 'zh-Hant': '{name} 做法', en: '{name} 做法' },
});
