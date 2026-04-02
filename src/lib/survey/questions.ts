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
    next: () => "food_q3",
  },
  {
    id: "food_q3",
    type: "single_choice",
    text_uz: "Kuniga nechta buyurtma bajarishingiz mumkin?",
    text_ru: "Сколько заказов в день сможете выполнять?",
    text_en: "How many orders per day can you handle?",
    options: [
      { value: "5-10", label_uz: "5–10 ta (o'zim yolg'iz)", label_ru: "5–10 (сам/сама)", label_en: "5–10 (by myself)" },
      { value: "10-30", label_uz: "10–30 ta (1-2 yordamchi bilan)", label_ru: "10–30 (с 1-2 помощниками)", label_en: "10–30 (with 1-2 helpers)" },
      { value: "30+", label_uz: "30+ (jamoa bilan, katta hajmda)", label_ru: "30+ (командой, большие объёмы)", label_en: "30+ (with a team, large scale)" },
    ],
    required: true,
    next: () => "food_q4",
  },
  {
    id: "food_q4",
    type: "single_choice",
    text_uz: "Yetkazib berishni qanday rejalashtirmoqdasiz?",
    text_ru: "Как планируете доставку?",
    text_en: "How do you plan to handle delivery?",
    options: [
      { value: "pickup", label_uz: "Mijoz o'zi olib ketadi", label_ru: "Самовывоз", label_en: "Customer picks up" },
      { value: "self_deliver", label_uz: "O'zim yetkazaman (velosiped/mototsikl)", label_ru: "Сам доставлю (велосипед/мотоцикл)", label_en: "I'll deliver (bike/motorcycle)" },
      { value: "partner", label_uz: "Express24 yoki Yandex Dostavka orqali", label_ru: "Через Express24 или Yandex Доставку", label_en: "Via Express24 or Yandex Delivery" },
      { value: "undecided", label_uz: "Hali qaror qilmadim", label_ru: "Ещё не решил", label_en: "Haven't decided yet" },
    ],
    required: true,
    next: () => "food_q5",
  },
  {
    id: "food_q5",
    type: "single_choice",
    text_uz: "Sanitariya guvohnomangiz bormi (SES)?",
    text_ru: "Есть ли санитарная книжка (СЭС)?",
    text_en: "Do you have a sanitary certificate?",
    options: [
      { value: "yes", label_uz: "Ha, bor", label_ru: "Да, есть", label_en: "Yes" },
      { value: "no", label_uz: "Yo'q, lekin olishim mumkin", label_ru: "Нет, но могу получить", label_en: "No, but I can get one" },
      { value: "unknown", label_uz: "Nima ekanini bilmayman", label_ru: "Не знаю что это", label_en: "I don't know what that is" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "beauty_q5",
  },
  {
    id: "beauty_q5",
    type: "single_choice",
    text_uz: "Instagram sahifangiz bormi?",
    text_ru: "Есть Instagram для работ?",
    text_en: "Do you have an Instagram for your work?",
    options: [
      { value: "active", label_uz: "Ha, faol sahifam bor, ishlarim bor", label_ru: "Да, есть активная страница с работами", label_en: "Yes, active page with portfolio" },
      { value: "exists", label_uz: "Bor, lekin kam post", label_ru: "Есть, но мало постов", label_en: "Exists but few posts" },
      { value: "no", label_uz: "Yo'q, yaratish kerak", label_ru: "Нет, нужно создать", label_en: "No, need to create one" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "sewing_q4",
  },
  {
    id: "sewing_q4",
    type: "single_choice",
    text_uz: "Mato va materiallarni qayerdan olasiz?",
    text_ru: "Где планируете закупать ткани?",
    text_en: "Where will you source fabrics?",
    options: [
      { value: "wholesale", label_uz: "Optom bozordan (Kuchka, Chorsu)", label_ru: "Оптом с базара (Кучка, Чорсу)", label_en: "Wholesale from bazaar" },
      { value: "supplier", label_uz: "Doimiy yetkazib beruvchim bor", label_ru: "Есть постоянный поставщик", label_en: "I have a regular supplier" },
      { value: "client", label_uz: "Mijoz o'zi olib keladi", label_ru: "Клиент приносит сам", label_en: "Client brings their own" },
      { value: "unsure", label_uz: "Hali bilmayman", label_ru: "Пока не знаю", label_en: "Not sure yet" },
    ],
    required: true,
    next: () => "sewing_q5",
  },
  {
    id: "sewing_q5",
    type: "single_choice",
    text_uz: "Kuniga nechta buyum tikishingiz mumkin?",
    text_ru: "Сколько изделий в день можете сшить?",
    text_en: "How many items can you sew per day?",
    options: [
      { value: "1-2", label_uz: "1–2 ta (murakkab buyumlar)", label_ru: "1–2 (сложные изделия)", label_en: "1–2 (complex items)" },
      { value: "3-5", label_uz: "3–5 ta (oddiy kiyimlar)", label_ru: "3–5 (простая одежда)", label_en: "3–5 (simple clothing)" },
      { value: "5+", label_uz: "5+ (sanoat hajmda)", label_ru: "5+ (промышленный объём)", label_en: "5+ (industrial volume)" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "trade_q3",
  },
  {
    id: "trade_q3",
    type: "single_choice",
    text_uz: "Yetkazib beruvchilar bilan aloqangiz bormi?",
    text_ru: "Есть связи с поставщиками?",
    text_en: "Do you have supplier connections?",
    options: [
      { value: "yes", label_uz: "Ha, optom sotuvchilarni bilaman", label_ru: "Да, знаю оптовых продавцов", label_en: "Yes, I know wholesalers" },
      { value: "some", label_uz: "Bir-ikkitasini bilaman", label_ru: "Знаю пару поставщиков", label_en: "Know a couple" },
      { value: "no", label_uz: "Yo'q, izlashim kerak", label_ru: "Нет, нужно искать", label_en: "No, need to find them" },
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
    next: () => "trade_q5",
  },
  {
    id: "trade_q5",
    type: "single_choice",
    text_uz: "Tumaningizda qaysi tovar kam — ko'proq talab bor?",
    text_ru: "Какого товара не хватает в вашем районе?",
    text_en: "What products are lacking in your district?",
    options: [
      { value: "food", label_uz: "Sifatli oziq-ovqat", label_ru: "Качественные продукты", label_en: "Quality food products" },
      { value: "clothes", label_uz: "Arzon kiyim va poyafzal", label_ru: "Доступная одежда и обувь", label_en: "Affordable clothing and shoes" },
      { value: "household", label_uz: "Uy-ro'zg'or buyumlari", label_ru: "Хозтовары", label_en: "Household goods" },
      { value: "unsure", label_uz: "Bilmayman, o'rganishim kerak", label_ru: "Не знаю, нужно изучить", label_en: "Not sure, need to research" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "agro_q5",
  },
  {
    id: "agro_q5",
    type: "single_choice",
    text_uz: "Mahsulotni qayerga sotasiz?",
    text_ru: "Куда будете продавать продукцию?",
    text_en: "Where will you sell your products?",
    options: [
      { value: "bazaar", label_uz: "Mahalliy bozorga", label_ru: "На местный базар", label_en: "Local bazaar" },
      { value: "restaurants", label_uz: "Restoranlarga va oshxonalarga", label_ru: "Ресторанам и столовым", label_en: "To restaurants and cafes" },
      { value: "wholesale", label_uz: "Optom sotuvchilarga", label_ru: "Оптовым покупателям", label_en: "To wholesalers" },
      { value: "neighbors", label_uz: "Qo'shnilarga va mahallaga", label_ru: "Соседям и по махалле", label_en: "To neighbors and community" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "repair_q4",
  },
  {
    id: "repair_q4",
    type: "single_choice",
    text_uz: "Ehtiyot qismlarni qayerdan olasiz?",
    text_ru: "Где будете закупать запчасти?",
    text_en: "Where will you get spare parts?",
    options: [
      { value: "contacts", label_uz: "Yetkazib beruvchilarim bor", label_ru: "Есть свои поставщики", label_en: "Have my own suppliers" },
      { value: "market", label_uz: "Bozordan (Malika, Urda, Sergeli)", label_ru: "С рынка (Малика, Урда, Сергели)", label_en: "From market (Malika, Urda, Sergeli)" },
      { value: "online", label_uz: "Internetdan buyurtma qilaman", label_ru: "Заказываю через интернет", label_en: "Order online" },
    ],
    required: true,
    next: () => "repair_q5",
  },
  {
    id: "repair_q5",
    type: "single_choice",
    text_uz: "Mijozlarni qanday topasiz?",
    text_ru: "Как будете находить клиентов?",
    text_en: "How will you find clients?",
    options: [
      { value: "word", label_uz: "Og'zaki — tanishlar va mahalla orqali", label_ru: "Сарафанное радио — знакомые и махалля", label_en: "Word of mouth — friends and community" },
      { value: "telegram", label_uz: "Telegram kanal va guruhlar orqali", label_ru: "Через Telegram каналы и группы", label_en: "Via Telegram channels and groups" },
      { value: "location", label_uz: "Bozor yonida yoki ko'chada joy ochaman", label_ru: "Открою точку у рынка или у дороги", label_en: "Open a spot near a market or road" },
      { value: "olx", label_uz: "OLX va e'lonlar orqali", label_ru: "Через OLX и объявления", label_en: "Via OLX and classifieds" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "transport_q4",
  },
  {
    id: "transport_q4",
    type: "single_choice",
    text_uz: "Kuniga qancha soat ishlashingiz mumkin?",
    text_ru: "Сколько часов в день готовы работать?",
    text_en: "How many hours per day can you work?",
    options: [
      { value: "part", label_uz: "4–6 soat (qo'shimcha daromad)", label_ru: "4–6 часов (подработка)", label_en: "4–6 hours (side income)" },
      { value: "full", label_uz: "8–10 soat (asosiy ish)", label_ru: "8–10 часов (основная работа)", label_en: "8–10 hours (main job)" },
      { value: "max", label_uz: "12+ soat (maksimal daromad)", label_ru: "12+ часов (максимум дохода)", label_en: "12+ hours (maximum income)" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "education_q4",
  },
  {
    id: "education_q4",
    type: "single_choice",
    text_uz: "Nechta o'quvchi bilan ishlashingiz mumkin?",
    text_ru: "Сколько учеников можете вести?",
    text_en: "How many students can you handle?",
    options: [
      { value: "individual", label_uz: "1–3 (individual darslar)", label_ru: "1–3 (индивидуальные)", label_en: "1–3 (individual lessons)" },
      { value: "small", label_uz: "5–10 (kichik guruhlar)", label_ru: "5–10 (небольшие группы)", label_en: "5–10 (small groups)" },
      { value: "large", label_uz: "10+ (katta guruhlar / markaz)", label_ru: "10+ (большие группы / центр)", label_en: "10+ (large groups / center)" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "digital_q4",
  },
  {
    id: "digital_q4",
    type: "single_choice",
    text_uz: "Mijozlarni qayerdan topish rejangiz bor?",
    text_ru: "Где планируете искать клиентов?",
    text_en: "Where do you plan to find clients?",
    options: [
      { value: "freelance", label_uz: "Upwork, Fiverr — xalqaro mijozlar", label_ru: "Upwork, Fiverr — международные клиенты", label_en: "Upwork, Fiverr — international clients" },
      { value: "local", label_uz: "Mahalliy bizneslar va tadbirkorlar", label_ru: "Местные бизнесы и предприниматели", label_en: "Local businesses and entrepreneurs" },
      { value: "social", label_uz: "Telegram guruhlar va Instagram", label_ru: "Telegram группы и Instagram", label_en: "Telegram groups and Instagram" },
      { value: "all", label_uz: "Hammasi — turli kanallardan", label_ru: "Все каналы — максимальный охват", label_en: "All channels — maximum reach" },
    ],
    required: true,
    next: () => "free_text",
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
    next: () => "services_q3",
  },
  {
    id: "services_q3",
    type: "single_choice",
    text_uz: "Tumaningizda bu xizmatga talab bormi?",
    text_ru: "Есть спрос на эту услугу в вашем районе?",
    text_en: "Is there demand for this service in your area?",
    options: [
      { value: "high", label_uz: "Ha, ko'p odam so'raydi", label_ru: "Да, многие спрашивают", label_en: "Yes, many people ask" },
      { value: "moderate", label_uz: "O'rtacha — bor lekin ko'p emas", label_ru: "Средний — есть, но не много", label_en: "Moderate — some but not a lot" },
      { value: "unsure", label_uz: "Bilmayman, tekshirish kerak", label_ru: "Не знаю, нужно проверить", label_en: "Not sure, need to check" },
    ],
    required: true,
    next: () => "services_q4",
  },
  {
    id: "services_q4",
    type: "single_choice",
    text_uz: "Yordamchilar kerakmi?",
    text_ru: "Нужны ли помощники?",
    text_en: "Will you need helpers?",
    options: [
      { value: "solo", label_uz: "O'zim yolg'iz ishlayman", label_ru: "Буду работать один/одна", label_en: "I'll work alone" },
      { value: "family", label_uz: "Oila a'zolari yordam beradi", label_ru: "Помогут члены семьи", label_en: "Family members will help" },
      { value: "hire", label_uz: "1–2 ishchi yollayman", label_ru: "Найму 1–2 работников", label_en: "Will hire 1–2 workers" },
    ],
    required: true,
    next: () => "free_text",
  },

  // ============================================================
  // Phase 3: Free text + Financial (all spheres converge here)
  // ============================================================
  {
    id: "free_text",
    type: "free_text",
    text_uz: "Aniqroq ayting — nima qilmoqchisiz? O'z so'zlaringiz bilan yozing",
    text_ru: "Расскажите подробнее — что именно хотите делать? Своими словами",
    text_en: "Tell us more — what exactly do you want to do? In your own words",
    required: true,
    next: () => "exact_capital",
  },
  {
    id: "exact_capital",
    type: "number_input",
    text_uz: "Hozir biznesga sarflashingiz mumkin bo'lgan aniq summani kiriting (mln so'mda)",
    text_ru: "Введите точную сумму которую можете вложить в бизнес (в млн сум)",
    text_en: "Enter the exact amount you can invest in the business (in mln UZS)",
    required: true,
    next: () => "collateral",
  },
  {
    id: "collateral",
    type: "single_choice",
    text_uz: "Kredit uchun garov qo'ya olasizmi?",
    text_ru: "Можете предоставить залог для кредита?",
    text_en: "Can you provide collateral for a loan?",
    options: [
      { value: "есть", label_uz: "Ha — uy, avto yoki yer", label_ru: "Да — дом, авто или земля", label_en: "Yes — house, car, or land" },
      { value: "нет", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
    ],
    required: true,
    next: () => "competition",
  },
  {
    id: "competition",
    type: "single_choice",
    text_uz: "Tumaningizda shu sohada raqobat bormi?",
    text_ru: "Есть конкуренция в этой сфере в вашем районе?",
    text_en: "Is there competition in this field in your district?",
    options: [
      { value: "нет", label_uz: "Yo'q yoki bilmayman", label_ru: "Нет или не знаю", label_en: "No or don't know" },
      { value: "1-3", label_uz: "Ha, 1–3 ta o'xshash biznes bor", label_ru: "Да, 1–3 похожих бизнеса", label_en: "Yes, 1–3 similar businesses" },
      { value: "много", label_uz: "Ko'p, lekin men farqli qilaman", label_ru: "Много, но я сделаю иначе", label_en: "Many, but I'll stand out" },
    ],
    required: true,
    next: () => "poor_registry",
  },
  {
    id: "poor_registry",
    type: "single_choice",
    text_uz: "Kam ta'minlangan oila maqomingiz bormi?",
    text_ru: "Есть статус малообеспеченной семьи?",
    text_en: "Do you have low-income family status?",
    options: [
      { value: "да", label_uz: "Ha", label_ru: "Да", label_en: "Yes" },
      { value: "нет", label_uz: "Yo'q", label_ru: "Нет", label_en: "No" },
      { value: "не знаю", label_uz: "Bilmayman", label_ru: "Не знаю", label_en: "Not sure" },
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
  "free_text", "exact_capital", "collateral", "competition", "poor_registry",
];

export const COMMON_QUESTION_IDS = ["lang", "district", "path", "register"];

// All sphere prefixes for progress calculation
export const SPHERE_QUESTION_COUNTS: Record<string, number> = {
  food: 5,
  beauty: 5,
  sewing: 5,
  trade: 5,
  agro: 5,
  repair: 5,
  transport: 4,
  education: 4,
  digital: 4,
  services: 4,
};
