import type { Question, SurveyAnswers } from "@/types";

export const questions: Question[] = [
  // ============================================================
  // Phase 1: Language + Location + Path + Registration
  // ============================================================
  {
    id: "lang",
    type: "single_choice",
    text_uz: "Tilni tanlang",
    text_ru: "Выберите язык",
    text_en: "Choose your language",
    options: [
      { value: "uz", label_uz: "O'zbek", label_ru: "O'zbek", label_en: "O'zbek" },
      { value: "ru", label_uz: "Ruscha", label_ru: "Русский", label_en: "Russian" },
      { value: "en", label_uz: "Inglizcha", label_ru: "English", label_en: "English" },
    ],
    required: true,
    next: () => "district",
  },
  {
    id: "district",
    type: "district_select",
    text_uz: "Qaysi tumanda yashaysiz?",
    text_ru: "В каком районе вы живёте?",
    text_en: "Which district do you live in?",
    required: true,
    next: () => "path",
  },
  {
    id: "path",
    type: "path_split",
    text_uz: "Maqsadingiz nima?",
    text_ru: "Какая у вас цель?",
    text_en: "What is your goal?",
    options: [
      { value: "job", label_uz: "Ish topish", label_ru: "Найти работу", label_en: "Find a job" },
      { value: "business", label_uz: "Biznes ochish", label_ru: "Открыть бизнес", label_en: "Start a business" },
    ],
    required: true,
    next: (a: SurveyAnswers) => a.path === "job" ? "job_skills" : "register",
  },
  {
    id: "register",
    type: "single_choice" as const,
    text_uz: "Ma'lumotlaringizni kiriting",
    text_ru: "Введите ваши данные",
    text_en: "Enter your information",
    required: true,
    next: () => "sphere",
  },

  // ============================================================
  // Phase 2: Sphere selection — what field do you want to work in?
  // ============================================================
  {
    id: "sphere",
    type: "single_choice",
    text_uz: "Qaysi sohada biznes qilmoqchisiz?",
    text_ru: "В какой сфере хотите открыть бизнес?",
    text_en: "Which field do you want to start a business in?",
    options: [
      { value: "food", label_uz: "Ovqat tayyorlash / non yopish", label_ru: "Еда / выпечка / кулинария", label_en: "Food / baking / catering" },
      { value: "beauty", label_uz: "Go'zallik / sartaroshlik", label_ru: "Красота / парикмахерская", label_en: "Beauty / hairdressing" },
      { value: "sewing", label_uz: "Tikuvchilik / kiyim tikish", label_ru: "Швейное дело / пошив одежды", label_en: "Sewing / clothing production" },
      { value: "trade", label_uz: "Savdo / do'kon / bozor", label_ru: "Торговля / магазин / рынок", label_en: "Trade / shop / market" },
      { value: "agro", label_uz: "Qishloq xo'jaligi / chorvachilik", label_ru: "Сельское хозяйство / животноводство", label_en: "Agriculture / livestock" },
      { value: "repair", label_uz: "Ta'mirlash (avto, telefon, qurilish)", label_ru: "Ремонт (авто, телефоны, стройка)", label_en: "Repair (auto, phones, construction)" },
      { value: "transport", label_uz: "Transport / taksi / yuk tashish", label_ru: "Транспорт / такси / грузоперевозки", label_en: "Transport / taxi / cargo" },
      { value: "education", label_uz: "Ta'lim / repetitorlik / bolalar", label_ru: "Образование / репетиторство / дети", label_en: "Education / tutoring / childcare" },
      { value: "digital", label_uz: "IT / dizayn / foto-video / onlayn savdo", label_ru: "IT / дизайн / фото-видео / онлайн", label_en: "IT / design / photo-video / online" },
      { value: "services", label_uz: "Xizmatlar (kir yuvish, tozalash va h.k.)", label_ru: "Услуги (прачечная, уборка и др.)", label_en: "Services (laundry, cleaning, etc.)" },
    ],
    required: true,
    next: (a: SurveyAnswers) => `${a.sphere}_q1`,
  },

  // ============================================================
  // FOOD sphere — 5 deep questions
  // ============================================================
  {
    id: "food_q1",
    type: "single_choice",
    text_uz: "Qanday turdagi ovqat tayyorlamoqchisiz?",
    text_ru: "Какой тип еды хотите готовить?",
    text_en: "What type of food do you want to prepare?",
    options: [
      { value: "home_meals", label_uz: "Uy ovqatlari — osh, sho'rva, lag'mon (kunlik buyurtma)", label_ru: "Домашняя еда — плов, шурпа, лагман (ежедневные заказы)", label_en: "Home meals — plov, soup, lagman (daily orders)" },
      { value: "bakery", label_uz: "Non, somsa, patir — tandirda yoki pechda", label_ru: "Хлеб, самса, лепёшки — в тандыре или печи", label_en: "Bread, samsa, flatbread — in tandoor or oven" },
      { value: "pastry", label_uz: "Tort, shirinlik, pechenye — bayramlar uchun", label_ru: "Торты, сладости, печенье — на заказ к праздникам", label_en: "Cakes, sweets, cookies — for events and orders" },
      { value: "street_food", label_uz: "Ko'cha ovqat — shashlik, hot-dog, burger", label_ru: "Стрит-фуд — шашлык, хот-доги, бургеры", label_en: "Street food — kebab, hot-dogs, burgers" },
    ],
    required: true,
    next: () => "food_q2",
  },
  {
    id: "food_q2",
    type: "single_choice",
    text_uz: "Oshxona jihozlaringiz bormi?",
    text_ru: "Какое кухонное оборудование у вас есть?",
    text_en: "What kitchen equipment do you have?",
    options: [
      { value: "home_kitchen", label_uz: "Oddiy uy oshxonasi", label_ru: "Обычная домашняя кухня", label_en: "Regular home kitchen" },
      { value: "has_tandoor", label_uz: "Tandirim yoki katta pechim bor", label_ru: "Есть тандыр или большая печь", label_en: "I have a tandoor or large oven" },
      { value: "semi_pro", label_uz: "Professional oshxona jihozlari bor (mikser, muzlatgich)", label_ru: "Есть проф. оборудование (миксер, морозилка)", label_en: "Have pro equipment (mixer, freezer)" },
      { value: "nothing", label_uz: "Hech narsa yo'q, noldan boshlayman", label_ru: "Ничего нет, начну с нуля", label_en: "Nothing, starting from scratch" },
    ],
    required: true,
    next: () => "food_q5",
  },
  {
    id: "food_q5",
    type: "single_choice",
    text_uz: "Oilangizda kim ovqat tayyorlashni yaxshi biladi?",
    text_ru: "Кто в вашей семье хорошо умеет готовить?",
    text_en: "Who in your family knows how to cook well?",
    options: [
      { value: "me_expert", label_uz: "Men — tajribali oshpazman", label_ru: "Я — опытный повар", label_en: "Me — experienced cook" },
      { value: "me_basic", label_uz: "Men — oddiy ovqat qila olaman", label_ru: "Я — могу готовить простую еду", label_en: "Me — can cook basic food" },
      { value: "family_member", label_uz: "Oila a'zolarimdan biri yaxshi pishiradi", label_ru: "Кто-то из семьи хорошо готовит", label_en: "A family member cooks well" },
      { value: "need_training", label_uz: "O'rganishim kerak", label_ru: "Нужно научиться", label_en: "Need training" },
    ],
    required: true,
    next: () => "food_q6",
  },
  {
    id: "food_q6",
    type: "single_choice",
    text_uz: "Kimlar sizga yordam bera oladi?",
    text_ru: "Кто может вам помочь?",
    text_en: "Who can help you?",
    options: [
      { value: "alone", label_uz: "Yolg'iz ishlayman", label_ru: "Работаю один(а)", label_en: "Work alone" },
      { value: "family_help", label_uz: "Oila a'zolari", label_ru: "Члены семьи", label_en: "Family members" },
      { value: "hire", label_uz: "Ishchi yollayman", label_ru: "Найму работника", label_en: "Will hire a worker" },
    ],
    required: true,
    next: () => "food_q7",
  },
  {
    id: "food_q7",
    type: "single_choice",
    text_uz: "Ish joyingiz qanday?",
    text_ru: "Какое у вас рабочее место?",
    text_en: "What's your workspace like?",
    options: [
      { value: "home_kitchen", label_uz: "Uy oshxonasi", label_ru: "Домашняя кухня", label_en: "Home kitchen" },
      { value: "separate_room", label_uz: "Alohida xona", label_ru: "Отдельное помещение", label_en: "Separate room" },
      { value: "rent_space", label_uz: "Ijara joy", label_ru: "Арендованное место", label_en: "Rented space" },
      { value: "none", label_uz: "Joy yo'q", label_ru: "Нет места", label_en: "No space" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // BEAUTY sphere — 5 deep questions
  // ============================================================
  {
    id: "beauty_q1",
    type: "single_choice",
    text_uz: "Qaysi xizmatlarni ko'rsatmoqchisiz?",
    text_ru: "Какие услуги хотите оказывать?",
    text_en: "Which services do you want to offer?",
    options: [
      { value: "hair", label_uz: "Soch turmagi — erkaklar va ayollar soch kesish", label_ru: "Стрижки — мужские и женские", label_en: "Haircuts — men's and women's" },
      { value: "nails", label_uz: "Manikur / pedikur / tirnoq dizayni", label_ru: "Маникюр / педикюр / дизайн ногтей", label_en: "Manicure / pedicure / nail art" },
      { value: "makeup", label_uz: "Makiyaj / to'y pardozi", label_ru: "Макияж / свадебный образ", label_en: "Makeup / bridal styling" },
      { value: "full_salon", label_uz: "To'liq salon — barchasi birga", label_ru: "Полный салон — все услуги", label_en: "Full salon — all services" },
    ],
    required: true,
    next: () => "beauty_q2",
  },
  {
    id: "beauty_q2",
    type: "single_choice",
    text_uz: "Bu sohada tajribangiz bormi?",
    text_ru: "Есть опыт в этой сфере?",
    text_en: "Do you have experience in this field?",
    options: [
      { value: "self", label_uz: "O'zimga va yaqinlarimga qilaman", label_ru: "Делаю себе и близким", label_en: "I do it for myself and friends" },
      { value: "course", label_uz: "Kurs tamomladim, sertifikatim bor", label_ru: "Закончила курсы, есть сертификат", label_en: "Completed a course, have certificate" },
      { value: "worked", label_uz: "Salonda ishlaganman 1+ yil", label_ru: "Работала в салоне 1+ год", label_en: "Worked in a salon 1+ year" },
      { value: "none", label_uz: "Tajribam yo'q, o'rganmoqchiman", label_ru: "Нет опыта, хочу научиться", label_en: "No experience, want to learn" },
    ],
    required: true,
    next: () => "beauty_q3",
  },
  {
    id: "beauty_q3",
    type: "single_choice",
    text_uz: "Asbob-uskunalaringiz bormi?",
    text_ru: "Какое оборудование у вас есть?",
    text_en: "What equipment do you have?",
    options: [
      { value: "basic", label_uz: "Asosiy — qaychi, fen, lak", label_ru: "Базовое — ножницы, фен, лак", label_en: "Basic — scissors, dryer, polish" },
      { value: "good", label_uz: "Yaxshi to'plam — professional asboblar", label_ru: "Хороший набор — проф. инструменты", label_en: "Good set — pro tools" },
      { value: "nothing", label_uz: "Hech narsa yo'q", label_ru: "Ничего нет", label_en: "Nothing at all" },
    ],
    required: true,
    next: () => "beauty_q4",
  },
  {
    id: "beauty_q4",
    type: "single_choice",
    text_uz: "Qayerda ishlash rejangiz bor?",
    text_ru: "Где планируете работать?",
    text_en: "Where do you plan to work?",
    options: [
      { value: "home", label_uz: "Uyda — alohida xona ajrataman", label_ru: "Дома — выделю отдельную комнату", label_en: "At home — dedicated room" },
      { value: "rent", label_uz: "Ijara xona yoki salon ichida joy", label_ru: "Арендую место в салоне или помещение", label_en: "Rent a chair or space" },
      { value: "mobile", label_uz: "Mijozlar uyiga boraman", label_ru: "Буду ездить к клиентам", label_en: "I'll go to clients" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // SEWING sphere — 5 deep questions
  // ============================================================
  {
    id: "sewing_q1",
    type: "single_choice",
    text_uz: "Qanday turdagi tikuvchilik qilmoqchisiz?",
    text_ru: "Какой вид швейного дела вас интересует?",
    text_en: "What type of sewing interests you?",
    options: [
      { value: "clothes", label_uz: "Kiyim tikish — ko'ylak, kostyum, libos", label_ru: "Пошив одежды — платья, костюмы", label_en: "Clothing — dresses, suits" },
      { value: "alterations", label_uz: "Ta'mirlash va qayta tikish", label_ru: "Ремонт и переделка одежды", label_en: "Alterations and repairs" },
      { value: "curtains", label_uz: "Parda, ko'rpa-to'shak, uy matolar", label_ru: "Шторы, постельное бельё, текстиль", label_en: "Curtains, bedding, home textiles" },
      { value: "national", label_uz: "Milliy kiyimlar — atlas, adras", label_ru: "Национальная одежда — атлас, адрас", label_en: "National clothing — atlas, adras" },
    ],
    required: true,
    next: () => "sewing_q2",
  },
  {
    id: "sewing_q2",
    type: "single_choice",
    text_uz: "Tikuv mashinangiz bormi?",
    text_ru: "Есть ли швейная машина?",
    text_en: "Do you have a sewing machine?",
    options: [
      { value: "industrial", label_uz: "Ha, sanoat mashinam bor (overlok ham)", label_ru: "Да, промышленная (с оверлоком)", label_en: "Yes, industrial (with overlock)" },
      { value: "home", label_uz: "Ha, uy mashinam bor", label_ru: "Да, домашняя машина", label_en: "Yes, home machine" },
      { value: "old", label_uz: "Eski mashina bor, yangilash kerak", label_ru: "Есть старая, нужно обновить", label_en: "Have an old one, need to upgrade" },
      { value: "none", label_uz: "Yo'q, sotib olish kerak", label_ru: "Нет, нужно купить", label_en: "No, need to buy" },
    ],
    required: true,
    next: () => "sewing_q3",
  },
  {
    id: "sewing_q3",
    type: "single_choice",
    text_uz: "Bu sohada tajribangiz qanday?",
    text_ru: "Какой у вас опыт в шитье?",
    text_en: "What's your sewing experience?",
    options: [
      { value: "pro", label_uz: "5+ yil, buyurtmalar bilan ishlaganman", label_ru: "5+ лет, работала с заказами", label_en: "5+ years, worked with orders" },
      { value: "medium", label_uz: "1–3 yil, o'zimga va tanishlarimga tikaman", label_ru: "1–3 года, шью для себя и знакомых", label_en: "1–3 years, sew for myself and friends" },
      { value: "beginner", label_uz: "Yangi boshladim yoki kurs tamomladim", label_ru: "Начинаю или закончила курсы", label_en: "Just starting or finished a course" },
    ],
    required: true,
    next: () => "sewing_q6",
  },
  {
    id: "sewing_q6",
    type: "single_choice",
    text_uz: "Yordamchi bormi?",
    text_ru: "Есть ли помощники?",
    text_en: "Do you have helpers?",
    options: [
      { value: "alone", label_uz: "Yolg'iz ishlayman", label_ru: "Работаю одна", label_en: "Work alone" },
      { value: "family", label_uz: "Oiladan yordam bor", label_ru: "Помогает семья", label_en: "Family helps" },
      { value: "will_hire", label_uz: "Keyinroq yollayman", label_ru: "Найму позже", label_en: "Will hire later" },
    ],
    required: true,
    next: () => "sewing_q7",
  },
  {
    id: "sewing_q7",
    type: "single_choice",
    text_uz: "Ish joyingiz bormi?",
    text_ru: "Есть ли у вас рабочее место?",
    text_en: "Do you have a workspace?",
    options: [
      { value: "home_room", label_uz: "Uyda xona bor", label_ru: "Есть комната дома", label_en: "Have a room at home" },
      { value: "rent", label_uz: "Ijaraga olaman", label_ru: "Буду арендовать", label_en: "Will rent" },
      { value: "no_space", label_uz: "Joy yo'q", label_ru: "Нет места", label_en: "No space" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // TRADE sphere — 5 deep questions
  // ============================================================
  {
    id: "trade_q1",
    type: "single_choice",
    text_uz: "Qanday savdo qilmoqchisiz?",
    text_ru: "Какой тип торговли вас интересует?",
    text_en: "What type of trade interests you?",
    options: [
      { value: "grocery", label_uz: "Oziq-ovqat do'koni (mahalla do'koni)", label_ru: "Продуктовый магазин (у дома)", label_en: "Grocery store (neighborhood)" },
      { value: "market", label_uz: "Bozorda savdo nuqtasi (kiyim, poyafzal)", label_ru: "Точка на рынке (одежда, обувь)", label_en: "Market stall (clothing, shoes)" },
      { value: "online", label_uz: "Onlayn savdo (Instagram/Telegram)", label_ru: "Онлайн (Instagram/Telegram)", label_en: "Online (Instagram/Telegram)" },
      { value: "wholesale", label_uz: "Ulgurji savdo (optom sotish)", label_ru: "Оптовая торговля", label_en: "Wholesale trade" },
    ],
    required: true,
    next: () => "trade_q2",
  },
  {
    id: "trade_q2",
    type: "single_choice",
    text_uz: "Savdo tajribangiz bormi?",
    text_ru: "Есть опыт в торговле?",
    text_en: "Do you have trading experience?",
    options: [
      { value: "yes", label_uz: "Ha, do'konda yoki bozorda ishlaganman", label_ru: "Да, работал в магазине или на рынке", label_en: "Yes, worked in a shop or market" },
      { value: "online", label_uz: "Onlayn sotganman (OLX, Instagram)", label_ru: "Продавал онлайн (OLX, Instagram)", label_en: "Sold online (OLX, Instagram)" },
      { value: "no", label_uz: "Tajribam yo'q", label_ru: "Нет опыта", label_en: "No experience" },
    ],
    required: true,
    next: () => "trade_q4",
  },
  {
    id: "trade_q4",
    type: "single_choice",
    text_uz: "Tovar uchun saqlash joyingiz bormi?",
    text_ru: "Есть место для хранения товара?",
    text_en: "Do you have storage for goods?",
    options: [
      { value: "yes", label_uz: "Ha, omborim yoki katta xonam bor", label_ru: "Да, есть склад или большое помещение", label_en: "Yes, have a warehouse or large room" },
      { value: "home", label_uz: "Uyda saqlashim mumkin", label_ru: "Могу хранить дома", label_en: "Can store at home" },
      { value: "no", label_uz: "Joyim yo'q", label_ru: "Места нет", label_en: "No storage space" },
    ],
    required: true,
    next: () => "trade_q6",
  },
  {
    id: "trade_q6",
    type: "single_choice",
    text_uz: "Transport imkoningiz bormi?",
    text_ru: "Есть ли у вас транспорт?",
    text_en: "Do you have transport?",
    options: [
      { value: "own_car", label_uz: "O'z mashinam bor", label_ru: "Есть своя машина", label_en: "Have my own car" },
      { value: "can_rent", label_uz: "Ijaraga olishim mumkin", label_ru: "Могу арендовать", label_en: "Can rent" },
      { value: "no_transport", label_uz: "Yo'q", label_ru: "Нет", label_en: "No transport" },
      { value: "not_needed", label_uz: "Kerak emas", label_ru: "Не нужен", label_en: "Not needed" },
    ],
    required: true,
    next: () => "trade_q7",
  },
  {
    id: "trade_q7",
    type: "single_choice",
    text_uz: "Kuniga qancha vaqt ajrata olasiz?",
    text_ru: "Сколько времени в день можете уделять?",
    text_en: "How much time per day can you dedicate?",
    options: [
      { value: "part_time", label_uz: "4–6 soat", label_ru: "4–6 часов", label_en: "4–6 hours" },
      { value: "full_time", label_uz: "8+ soat", label_ru: "8+ часов", label_en: "8+ hours" },
      { value: "flexible", label_uz: "Moslashuvchan", label_ru: "Гибкий график", label_en: "Flexible" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // AGRO sphere — 5 deep questions
  // ============================================================
  {
    id: "agro_q1",
    type: "single_choice",
    text_uz: "Qaysi yo'nalishda ishlamoqchisiz?",
    text_ru: "Какое направление вас интересует?",
    text_en: "Which direction interests you?",
    options: [
      { value: "greenhouse", label_uz: "Issiqxona — pomidor, bodring, sabzavot", label_ru: "Теплица — помидоры, огурцы, овощи", label_en: "Greenhouse — tomatoes, cucumbers, vegetables" },
      { value: "poultry", label_uz: "Parrandachilik — tovuq, bedana", label_ru: "Птицеводство — куры, перепела", label_en: "Poultry — chickens, quail" },
      { value: "livestock", label_uz: "Chorvachilik — sigir, qo'y, echki", label_ru: "Животноводство — коровы, овцы, козы", label_en: "Livestock — cows, sheep, goats" },
      { value: "fruit", label_uz: "Mevazor / uzumzor", label_ru: "Фруктовый / виноградный сад", label_en: "Orchard / vineyard" },
    ],
    required: true,
    next: () => "agro_q2",
  },
  {
    id: "agro_q2",
    type: "single_choice",
    text_uz: "Yer maydoni bormi?",
    text_ru: "Есть земельный участок?",
    text_en: "Do you have land?",
    options: [
      { value: "own_big", label_uz: "Ha, 10+ sotix o'z yerim", label_ru: "Да, 10+ соток своей земли", label_en: "Yes, 10+ sotix of own land" },
      { value: "own_small", label_uz: "Ha, lekin kichik (5 sotixgacha)", label_ru: "Да, но маленький (до 5 соток)", label_en: "Yes, but small (up to 5 sotix)" },
      { value: "rent", label_uz: "Ijaraga olishim mumkin", label_ru: "Могу арендовать", label_en: "Can rent" },
      { value: "none", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
    ],
    required: true,
    next: () => "agro_q3",
  },
  {
    id: "agro_q3",
    type: "single_choice",
    text_uz: "Qishloq xo'jaligida tajribangiz bormi?",
    text_ru: "Есть опыт в сельском хозяйстве?",
    text_en: "Do you have agricultural experience?",
    options: [
      { value: "family", label_uz: "Ha, oilamiz bilan shug'ullanganmiz", label_ru: "Да, занимались семьёй", label_en: "Yes, family experience" },
      { value: "worked", label_uz: "Fermerda ishlaganman", label_ru: "Работал на ферме", label_en: "Worked on a farm" },
      { value: "hobby", label_uz: "Bog'da o'stirganman (hobbi)", label_ru: "Выращивал в огороде (хобби)", label_en: "Grew in garden (hobby)" },
      { value: "none", label_uz: "Tajribam yo'q", label_ru: "Нет опыта", label_en: "No experience" },
    ],
    required: true,
    next: () => "agro_q4",
  },
  {
    id: "agro_q4",
    type: "single_choice",
    text_uz: "Suv ta'minoti qanday?",
    text_ru: "Как обстоит дело с водоснабжением?",
    text_en: "What's the water supply situation?",
    options: [
      { value: "good", label_uz: "Yaxshi — ariq yoki quduq bor", label_ru: "Хорошее — есть арык или колодец", label_en: "Good — have irrigation or well" },
      { value: "limited", label_uz: "Cheklangan — faqat shahar suvi", label_ru: "Ограниченное — только водопровод", label_en: "Limited — only city water" },
      { value: "poor", label_uz: "Yomon — suv muammosi bor", label_ru: "Плохое — проблемы с водой", label_en: "Poor — water problems" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // REPAIR sphere — 5 deep questions
  // ============================================================
  {
    id: "repair_q1",
    type: "single_choice",
    text_uz: "Qanday ta'mirlash bilan shug'ullanmoqchisiz?",
    text_ru: "Каким ремонтом хотите заниматься?",
    text_en: "What type of repair do you want to do?",
    options: [
      { value: "phone", label_uz: "Telefon va elektronika ta'mirlash", label_ru: "Телефоны и электроника", label_en: "Phones and electronics" },
      { value: "car", label_uz: "Avto ta'mirlash (STO)", label_ru: "Авторемонт (СТО)", label_en: "Auto repair" },
      { value: "construction", label_uz: "Uy ta'mirlash (santexnika, elektrika, kafel)", label_ru: "Ремонт квартир (сантехника, электрика, плитка)", label_en: "Home repair (plumbing, electrical, tiling)" },
      { value: "appliance", label_uz: "Maishiy texnika (kir mashinasi, muzlatgich)", label_ru: "Бытовая техника (стиралки, холодильники)", label_en: "Appliances (washers, fridges)" },
    ],
    required: true,
    next: () => "repair_q2",
  },
  {
    id: "repair_q2",
    type: "single_choice",
    text_uz: "Bu sohada qancha tajribangiz bor?",
    text_ru: "Сколько опыта в этой сфере?",
    text_en: "How much experience do you have?",
    options: [
      { value: "pro", label_uz: "3+ yil, doimiy mijozlarim bor", label_ru: "3+ лет, есть постоянные клиенты", label_en: "3+ years, have regular clients" },
      { value: "medium", label_uz: "1–3 yil, do'stlarga qilganman", label_ru: "1–3 года, делал друзьям", label_en: "1–3 years, done for friends" },
      { value: "learning", label_uz: "O'rganmoqdaman (YouTube, kurslar)", label_ru: "Учусь (YouTube, курсы)", label_en: "Learning (YouTube, courses)" },
    ],
    required: true,
    next: () => "repair_q3",
  },
  {
    id: "repair_q3",
    type: "single_choice",
    text_uz: "Asbob-uskunalaringiz qanday?",
    text_ru: "Какие у вас инструменты?",
    text_en: "What tools do you have?",
    options: [
      { value: "full", label_uz: "To'liq to'plam — ishlashga tayyor", label_ru: "Полный набор — готов работать", label_en: "Full set — ready to work" },
      { value: "basic", label_uz: "Asosiy asboblar bor, to'ldirish kerak", label_ru: "Базовые есть, нужно докупить", label_en: "Basic tools, need more" },
      { value: "none", label_uz: "Deyarli hech narsa yo'q", label_ru: "Почти ничего нет", label_en: "Almost nothing" },
    ],
    required: true,
    next: () => "repair_q6",
  },
  {
    id: "repair_q6",
    type: "single_choice",
    text_uz: "Ish joyingiz bormi?",
    text_ru: "Есть ли у вас рабочее место?",
    text_en: "Do you have a workspace?",
    options: [
      { value: "home", label_uz: "Uyda", label_ru: "Дома", label_en: "At home" },
      { value: "market_spot", label_uz: "Bozorda joy", label_ru: "Место на рынке", label_en: "Market spot" },
      { value: "rent", label_uz: "Ijaraga olaman", label_ru: "Буду арендовать", label_en: "Will rent" },
      { value: "mobile", label_uz: "Mijozlar uyiga boraman", label_ru: "Буду ездить к клиентам", label_en: "Will go to clients" },
    ],
    required: true,
    next: () => "repair_q7",
  },
  {
    id: "repair_q7",
    type: "single_choice",
    text_uz: "Qanday turdagi ishlarni qila olasiz?",
    text_ru: "Какие виды работ вы можете выполнять?",
    text_en: "What type of work can you do?",
    options: [
      { value: "basic", label_uz: "Oddiy — ekran almashtirish, simlarni ulash", label_ru: "Простое — замена экрана, подключение проводов", label_en: "Basic — screen replacement, wiring" },
      { value: "medium", label_uz: "O'rtacha — platani lehimlash, motorni tuzatish", label_ru: "Среднее — пайка плат, ремонт двигателя", label_en: "Medium — board soldering, motor repair" },
      { value: "advanced", label_uz: "Murakkab — diagnostika, mikrosxema ta'mirlash", label_ru: "Сложное — диагностика, ремонт микросхем", label_en: "Advanced — diagnostics, microchip repair" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // TRANSPORT sphere — 4 deep questions
  // ============================================================
  {
    id: "transport_q1",
    type: "single_choice",
    text_uz: "Qanday transport xizmati ko'rsatmoqchisiz?",
    text_ru: "Какой вид транспортных услуг?",
    text_en: "What type of transport service?",
    options: [
      { value: "taxi", label_uz: "Taksi (Yandex, Uklon, MyTaxi)", label_ru: "Такси (Яндекс, Uklon, MyTaxi)", label_en: "Taxi (Yandex, Uklon, MyTaxi)" },
      { value: "cargo", label_uz: "Yuk tashish (Damas, Porter, GAZel)", label_ru: "Грузоперевозки (Дамас, Портер, Газель)", label_en: "Cargo (Damas, Porter, GAZel)" },
      { value: "delivery", label_uz: "Kurerlik / yetkazib berish", label_ru: "Курьерская доставка", label_en: "Courier / delivery" },
      { value: "intercity", label_uz: "Shaharlararo yo'lovchi tashish", label_ru: "Междугородние пассажирские", label_en: "Intercity passenger transport" },
    ],
    required: true,
    next: () => "transport_q2",
  },
  {
    id: "transport_q2",
    type: "single_choice",
    text_uz: "Avtomobilingiz bormi?",
    text_ru: "Есть автомобиль?",
    text_en: "Do you have a vehicle?",
    options: [
      { value: "own_car", label_uz: "Ha, yengil avto (Cobalt, Nexia, Spark)", label_ru: "Да, легковой (Cobalt, Nexia, Spark)", label_en: "Yes, car (Cobalt, Nexia, Spark)" },
      { value: "own_cargo", label_uz: "Ha, yuk mashinam bor (Damas, Porter)", label_ru: "Да, грузовой (Дамас, Портер)", label_en: "Yes, cargo (Damas, Porter)" },
      { value: "buy", label_uz: "Yo'q, sotib olishim kerak", label_ru: "Нет, нужно купить", label_en: "No, need to buy" },
      { value: "rent", label_uz: "Ijaraga olishim mumkin", label_ru: "Могу взять в аренду", label_en: "Can rent one" },
    ],
    required: true,
    next: () => "transport_q3",
  },
  {
    id: "transport_q3",
    type: "single_choice",
    text_uz: "Haydovchilik huquqi bormi?",
    text_ru: "Есть водительские права?",
    text_en: "Do you have a driver's license?",
    options: [
      { value: "bc", label_uz: "Ha, B va C toifa", label_ru: "Да, категории B и C", label_en: "Yes, categories B and C" },
      { value: "b", label_uz: "Ha, faqat B toifa", label_ru: "Да, только категория B", label_en: "Yes, only category B" },
      { value: "no", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
    ],
    required: true,
    next: () => "transport_q5",
  },
  {
    id: "transport_q5",
    type: "single_choice",
    text_uz: "Kimlar bilan birga ishlashingiz mumkin?",
    text_ru: "С кем вы можете работать вместе?",
    text_en: "Who can you work with?",
    options: [
      { value: "alone", label_uz: "O'zim yolg'iz", label_ru: "Один(а)", label_en: "Alone" },
      { value: "family_driver", label_uz: "Oiladan haydovchi bor", label_ru: "В семье есть водитель", label_en: "Family member who drives" },
      { value: "partner", label_uz: "Sherik topishim mumkin", label_ru: "Могу найти партнёра", label_en: "Can find a partner" },
    ],
    required: true,
    next: () => "transport_q6",
  },
  {
    id: "transport_q6",
    type: "single_choice",
    text_uz: "Yo'nalishni bilasizmi?",
    text_ru: "Знаете ли вы маршрут?",
    text_en: "Do you know the route?",
    options: [
      { value: "know_well", label_uz: "Yaxshi bilaman", label_ru: "Хорошо знаю", label_en: "Know well" },
      { value: "somewhat", label_uz: "Qisman", label_ru: "Частично", label_en: "Somewhat" },
      { value: "new_area", label_uz: "Yangi hudud", label_ru: "Новая территория", label_en: "New area" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // EDUCATION sphere — 4 deep questions
  // ============================================================
  {
    id: "education_q1",
    type: "single_choice",
    text_uz: "Qaysi ta'lim yo'nalishida ishlaysiz?",
    text_ru: "Какое направление образования?",
    text_en: "Which education field?",
    options: [
      { value: "tutoring", label_uz: "Repetitorlik (matematika, tillar, fanlar)", label_ru: "Репетиторство (математика, языки, предметы)", label_en: "Tutoring (math, languages, subjects)" },
      { value: "language", label_uz: "Til kurslari (ingliz, rus, koreya)", label_ru: "Языковые курсы (английский, русский, корейский)", label_en: "Language courses (English, Russian, Korean)" },
      { value: "kindergarten", label_uz: "Xususiy bolalar bog'chasi / yozgi lager", label_ru: "Частный детский сад / летний лагерь", label_en: "Private kindergarten / summer camp" },
      { value: "skills", label_uz: "Kasbiy kurslar (tikuvchilik, oshpazlik, IT)", label_ru: "Профессиональные курсы (шитьё, кулинария, IT)", label_en: "Professional courses (sewing, cooking, IT)" },
    ],
    required: true,
    next: () => "education_q2",
  },
  {
    id: "education_q2",
    type: "single_choice",
    text_uz: "Bu sohada tajribangiz bormi?",
    text_ru: "Есть педагогический опыт?",
    text_en: "Do you have teaching experience?",
    options: [
      { value: "teacher", label_uz: "Ha, maktabda yoki kursda ishlaganman", label_ru: "Да, работал в школе или на курсах", label_en: "Yes, worked in school or courses" },
      { value: "informal", label_uz: "Norasmiy — bolalarga, tanishlarga o'rgatganman", label_ru: "Неформально — учил детей, знакомых", label_en: "Informally — taught kids, friends" },
      { value: "none", label_uz: "Yo'q, lekin bilimim bor", label_ru: "Нет, но знания есть", label_en: "No, but I have the knowledge" },
    ],
    required: true,
    next: () => "education_q3",
  },
  {
    id: "education_q3",
    type: "single_choice",
    text_uz: "Dars o'tish formatini tanlang",
    text_ru: "Формат преподавания?",
    text_en: "Teaching format?",
    options: [
      { value: "offline", label_uz: "Faqat oflayn — uyda yoki ijarada", label_ru: "Только офлайн — дома или в аренде", label_en: "Offline only — at home or rented space" },
      { value: "online", label_uz: "Faqat onlayn (Zoom, Telegram)", label_ru: "Только онлайн (Zoom, Telegram)", label_en: "Online only (Zoom, Telegram)" },
      { value: "hybrid", label_uz: "Aralash — onlayn va oflayn", label_ru: "Смешанный — онлайн и офлайн", label_en: "Hybrid — online and offline" },
    ],
    required: true,
    next: () => "education_q5",
  },
  {
    id: "education_q5",
    type: "single_choice",
    text_uz: "Dars o'tish uchun joyingiz bormi?",
    text_ru: "Есть ли место для проведения уроков?",
    text_en: "Do you have a space for lessons?",
    options: [
      { value: "home_room", label_uz: "Uyda xona bor", label_ru: "Есть комната дома", label_en: "Have a room at home" },
      { value: "rented", label_uz: "Ijaraga olganman", label_ru: "Арендую помещение", label_en: "Rented space" },
      { value: "online_only", label_uz: "Faqat onlayn", label_ru: "Только онлайн", label_en: "Online only" },
      { value: "no_space", label_uz: "Joy yo'q", label_ru: "Нет места", label_en: "No space" },
    ],
    required: true,
    next: () => "education_q6",
  },
  {
    id: "education_q6",
    type: "single_choice",
    text_uz: "Qaysi fandan eng kuchli bilimingiz bor?",
    text_ru: "В каком предмете у вас самые сильные знания?",
    text_en: "Which subject is your strongest?",
    options: [
      { value: "math", label_uz: "Matematika", label_ru: "Математика", label_en: "Mathematics" },
      { value: "languages", label_uz: "Tillar — ingliz, rus, koreys", label_ru: "Языки — английский, русский, корейский", label_en: "Languages — English, Russian, Korean" },
      { value: "science", label_uz: "Fanlar — fizika, kimyo", label_ru: "Науки — физика, химия", label_en: "Sciences — physics, chemistry" },
      { value: "it_skills", label_uz: "IT va kompyuter", label_ru: "IT и компьютер", label_en: "IT and computers" },
      { value: "creative", label_uz: "Ijodiy — musiqa, rasmchilik", label_ru: "Творческое — музыка, рисование", label_en: "Creative — music, drawing" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // DIGITAL sphere — 4 deep questions
  // ============================================================
  {
    id: "digital_q1",
    type: "single_choice",
    text_uz: "Qaysi raqamli xizmatlar bilan shug'ullanasiz?",
    text_ru: "Какие цифровые услуги хотите оказывать?",
    text_en: "Which digital services do you want to offer?",
    options: [
      { value: "web", label_uz: "Veb-sayt va dastur yaratish", label_ru: "Создание сайтов и приложений", label_en: "Website and app development" },
      { value: "smm", label_uz: "SMM — ijtimoiy tarmoqlarni yuritish", label_ru: "SMM — ведение соцсетей", label_en: "SMM — social media management" },
      { value: "photo_video", label_uz: "Foto/video suratga olish va montaj", label_ru: "Фото/видео съёмка и монтаж", label_en: "Photo/video shooting and editing" },
      { value: "design", label_uz: "Grafik dizayn (logotip, reklama)", label_ru: "Графический дизайн (логотипы, реклама)", label_en: "Graphic design (logos, advertising)" },
      { value: "online_shop", label_uz: "Onlayn do'kon (Instagram/Telegram)", label_ru: "Онлайн-магазин (Instagram/Telegram)", label_en: "Online shop (Instagram/Telegram)" },
    ],
    required: true,
    next: () => "digital_q2",
  },
  {
    id: "digital_q2",
    type: "single_choice",
    text_uz: "Bu sohada tajribangiz qanday?",
    text_ru: "Какой опыт в этой сфере?",
    text_en: "What's your experience level?",
    options: [
      { value: "pro", label_uz: "Freelance yoki kompaniyada ishlaganman", label_ru: "Работал фрилансером или в компании", label_en: "Worked freelance or in a company" },
      { value: "portfolio", label_uz: "Portfolio bor, lekin doimiy ish qilmadim", label_ru: "Есть портфолио, но не работал постоянно", label_en: "Have a portfolio but no steady work" },
      { value: "learning", label_uz: "O'rganmoqdaman (kurslar, YouTube)", label_ru: "Учусь (курсы, YouTube)", label_en: "Learning (courses, YouTube)" },
    ],
    required: true,
    next: () => "digital_q3",
  },
  {
    id: "digital_q3",
    type: "single_choice",
    text_uz: "Qanday texnik jihozlaringiz bor?",
    text_ru: "Какое оборудование есть?",
    text_en: "What equipment do you have?",
    options: [
      { value: "good", label_uz: "Yaxshi kompyuter/noutbuk + internet", label_ru: "Хороший компьютер/ноутбук + интернет", label_en: "Good computer/laptop + internet" },
      { value: "phone", label_uz: "Faqat telefon", label_ru: "Только телефон", label_en: "Phone only" },
      { value: "camera", label_uz: "Kamera + kompyuter (foto/video uchun)", label_ru: "Камера + компьютер (для фото/видео)", label_en: "Camera + computer (for photo/video)" },
      { value: "need", label_uz: "Sotib olishim kerak", label_ru: "Нужно купить", label_en: "Need to buy" },
    ],
    required: true,
    next: () => "digital_q5",
  },
  {
    id: "digital_q5",
    type: "single_choice",
    text_uz: "Hozir qanday qurilmangiz bor?",
    text_ru: "Какое устройство у вас сейчас есть?",
    text_en: "What device do you currently have?",
    options: [
      { value: "good_pc", label_uz: "Kuchli kompyuter/noutbuk", label_ru: "Мощный компьютер/ноутбук", label_en: "Powerful computer/laptop" },
      { value: "basic_pc", label_uz: "Oddiy kompyuter", label_ru: "Обычный компьютер", label_en: "Basic computer" },
      { value: "phone_only", label_uz: "Faqat telefon", label_ru: "Только телефон", label_en: "Phone only" },
      { value: "need_buy", label_uz: "Sotib olishim kerak", label_ru: "Нужно купить", label_en: "Need to buy" },
    ],
    required: true,
    next: () => "digital_q6",
  },
  {
    id: "digital_q6",
    type: "single_choice",
    text_uz: "Internet tezligingiz qanday?",
    text_ru: "Какая у вас скорость интернета?",
    text_en: "How's your internet speed?",
    options: [
      { value: "fast", label_uz: "Tez, stabil", label_ru: "Быстрый, стабильный", label_en: "Fast, stable" },
      { value: "moderate", label_uz: "O'rtacha", label_ru: "Средний", label_en: "Moderate" },
      { value: "slow", label_uz: "Sekin, uziladi", label_ru: "Медленный, с обрывами", label_en: "Slow, with interruptions" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // SERVICES sphere — 4 deep questions
  // ============================================================
  {
    id: "services_q1",
    type: "single_choice",
    text_uz: "Qanday xizmat ko'rsatmoqchisiz?",
    text_ru: "Какие услуги хотите оказывать?",
    text_en: "What services do you want to offer?",
    options: [
      { value: "laundry", label_uz: "Kir yuvish / kimyoviy tozalash", label_ru: "Прачечная / химчистка", label_en: "Laundry / dry cleaning" },
      { value: "cleaning", label_uz: "Uy tozalash (klining)", label_ru: "Уборка квартир (клининг)", label_en: "House cleaning" },
      { value: "car_wash", label_uz: "Avtomobil yuvish", label_ru: "Автомойка", label_en: "Car wash" },
      { value: "other", label_uz: "Boshqa xizmatlar", label_ru: "Другие услуги", label_en: "Other services" },
    ],
    required: true,
    next: () => "services_q2",
  },
  {
    id: "services_q2",
    type: "single_choice",
    text_uz: "Bu xizmat uchun maxsus jihozlar kerakmi?",
    text_ru: "Нужно специальное оборудование?",
    text_en: "Do you need special equipment?",
    options: [
      { value: "have", label_uz: "Ha, va menda bor", label_ru: "Да, и оно у меня есть", label_en: "Yes, and I have it" },
      { value: "buy", label_uz: "Ha, sotib olishim kerak", label_ru: "Да, нужно купить", label_en: "Yes, need to buy" },
      { value: "minimal", label_uz: "Minimal jihozlar kerak", label_ru: "Нужно минимум оборудования", label_en: "Minimal equipment needed" },
    ],
    required: true,
    next: () => "services_q5",
  },
  {
    id: "services_q5",
    type: "single_choice",
    text_uz: "Ish joyingiz bormi?",
    text_ru: "Есть ли у вас рабочее место?",
    text_en: "Do you have a workspace?",
    options: [
      { value: "own_space", label_uz: "O'z joyim bor", label_ru: "Есть своё место", label_en: "Have my own space" },
      { value: "rent", label_uz: "Ijaraga olaman", label_ru: "Буду арендовать", label_en: "Will rent" },
      { value: "mobile", label_uz: "Mijozlar uyiga boraman", label_ru: "Буду ездить к клиентам", label_en: "Will go to clients" },
      { value: "none", label_uz: "Joy yo'q", label_ru: "Нет места", label_en: "No space" },
    ],
    required: true,
    next: () => "services_q6",
  },
  {
    id: "services_q6",
    type: "single_choice",
    text_uz: "Kuniga qancha vaqt ajrata olasiz?",
    text_ru: "Сколько времени в день можете уделять?",
    text_en: "How much time per day can you dedicate?",
    options: [
      { value: "part_time", label_uz: "4–6 soat", label_ru: "4–6 часов", label_en: "4–6 hours" },
      { value: "full_time", label_uz: "8+ soat", label_ru: "8+ часов", label_en: "8+ hours" },
      { value: "flexible", label_uz: "Moslashuvchan", label_ru: "Гибкий график", label_en: "Flexible" },
    ],
    required: true,
    next: () => "exact_capital",
  },

  // ============================================================
  // Phase 3: Financial (all spheres converge here)
  // ============================================================
  {
    id: "exact_capital",
    type: "number_input",
    text_uz: "Biznesga sarflashingiz mumkin bo'lgan summani kiriting (mln so'mda)",
    text_ru: "Сколько можете вложить в бизнес? (в млн сум)",
    text_en: "How much can you invest? (in mln UZS)",
    required: false,
    next: () => "competition",
  },
  {
    id: "competition",
    type: "single_choice",
    text_uz: "Tumaningizda shu sohada raqobat bormi?",
    text_ru: "Есть конкуренция в этой сфере в вашем районе?",
    text_en: "Is there competition in this field in your district?",
    options: [
      { value: "none", label_uz: "Yo'q yoki bilmayman", label_ru: "Нет или не знаю", label_en: "No or don't know" },
      { value: "few", label_uz: "Ha, 1–3 ta o'xshash biznes bor", label_ru: "Да, 1–3 похожих бизнеса", label_en: "Yes, 1–3 similar businesses" },
      { value: "many", label_uz: "Ko'p, lekin men farqli qilaman", label_ru: "Много, но я сделаю иначе", label_en: "Many, but I'll stand out" },
    ],
    required: true,
    next: () => "poor_registry",
  },
  {
    id: "poor_registry",
    type: "single_choice",
    text_uz: "Davlat tomonidan ijtimoiy yordam yoki imtiyozli dasturlarga kiritilganmisiz?",
    text_ru: "Участвуете ли вы в государственных программах социальной поддержки?",
    text_en: "Are you enrolled in any government social support programs?",
    options: [
      { value: "yes", label_uz: "Ha, ro'yxatga kiritilganman", label_ru: "Да, я в реестре", label_en: "Yes, I'm registered" },
      { value: "no", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
      { value: "unknown", label_uz: "Aniq bilmayman", label_ru: "Точно не знаю", label_en: "Not sure" },
    ],
    required: true,
    next: () => null,
  },

  // ============================================================
  // Path A — Job (unchanged)
  // ============================================================
  {
    id: "job_skills",
    type: "multi_choice",
    text_uz: "Qanday ko'nikmalaringiz bor?",
    text_ru: "Какие у вас навыки?",
    text_en: "What skills do you have?",
    options: [
      { value: "driving", label_uz: "Haydovchilik", label_ru: "Вождение", label_en: "Driving" },
      { value: "cooking", label_uz: "Oshpazlik", label_ru: "Готовка", label_en: "Cooking" },
      { value: "sewing", label_uz: "Tikuvchilik", label_ru: "Шитьё", label_en: "Sewing" },
      { value: "construction", label_uz: "Qurilish", label_ru: "Строительство", label_en: "Construction" },
      { value: "it", label_uz: "IT / kompyuter", label_ru: "IT / компьютер", label_en: "IT / computers" },
      { value: "sales", label_uz: "Savdo", label_ru: "Продажи", label_en: "Sales" },
      { value: "teaching", label_uz: "O'qitish", label_ru: "Обучение", label_en: "Teaching" },
      { value: "medical", label_uz: "Tibbiyot", label_ru: "Медицина", label_en: "Healthcare" },
      { value: "security", label_uz: "Qo'riqchi", label_ru: "Охрана", label_en: "Security" },
      { value: "other", label_uz: "Boshqa", label_ru: "Другое", label_en: "Other" },
    ],
    required: true,
    next: () => "job_experience",
  },
  {
    id: "job_experience",
    type: "single_choice",
    text_uz: "Ish tajribangiz?",
    text_ru: "Опыт работы?",
    text_en: "Work experience?",
    options: [
      { value: "0-1", label_uz: "1 yilgacha", label_ru: "До 1 года", label_en: "Under 1 year" },
      { value: "1-3", label_uz: "1–3 yil", label_ru: "1–3 года", label_en: "1–3 years" },
      { value: "3-5", label_uz: "3–5 yil", label_ru: "3–5 лет", label_en: "3–5 years" },
      { value: "5+", label_uz: "5+ yil", label_ru: "5+ лет", label_en: "5+ years" },
    ],
    required: true,
    next: () => "job_salary",
  },
  {
    id: "job_salary",
    type: "single_choice",
    text_uz: "Qancha maosh kutasiz?",
    text_ru: "Какую зарплату ожидаете?",
    text_en: "Expected salary?",
    options: [
      { value: "any", label_uz: "Farqi yo'q", label_ru: "Любая", label_en: "Any" },
      { value: "2-4", label_uz: "2–4 mln", label_ru: "2–4 млн", label_en: "2–4M" },
      { value: "4-7", label_uz: "4–7 mln", label_ru: "4–7 млн", label_en: "4–7M" },
      { value: "7+", label_uz: "7+ mln", label_ru: "7+ млн", label_en: "7+M" },
    ],
    required: true,
    next: () => "job_relocate",
  },
  {
    id: "job_relocate",
    type: "single_choice",
    text_uz: "Ko'chishga tayyormisiz?",
    text_ru: "Готовы к переезду?",
    text_en: "Ready to relocate?",
    options: [
      { value: "да", label_uz: "Ha", label_ru: "Да", label_en: "Yes" },
      { value: "область", label_uz: "Viloyat ichida", label_ru: "В пределах области", label_en: "Within region" },
      { value: "нет", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
    ],
    required: true,
    next: () => null,
  },
];

const questionsMap = new Map(questions.map((q) => [q.id, q]));

export function getQuestionById(id: string): Question | undefined {
  return questionsMap.get(id);
}

export const FIRST_QUESTION_ID = "lang";

export const JOB_QUESTION_IDS = ["job_skills", "job_experience", "job_salary", "job_relocate"];

// Dynamic — sphere-specific + common financial
// gender + age come from registration, priority removed (not useful)
export const BUSINESS_QUESTION_IDS = [
  "sphere",
  // sphere-specific questions are dynamic (food_q1..food_q5, etc.)
  "exact_capital", "competition", "poor_registry",
];

export const COMMON_QUESTION_IDS = ["lang", "district", "path", "register"];

// All sphere prefixes for progress calculation
export const SPHERE_QUESTION_COUNTS: Record<string, number> = {
  food: 5,
  beauty: 4,
  sewing: 5,
  trade: 5,
  agro: 4,
  repair: 5,
  transport: 5,
  education: 5,
  digital: 5,
  services: 4,
};
