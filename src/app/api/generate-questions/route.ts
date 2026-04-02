import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { description, lang } = await req.json();
    if (!description) {
      return Response.json(
        { error: "description required" },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen biznes-maslahatchi AI san. Foydalanuvchi o'zi xohlagan biznes turini yozdi. Sening vazifang — uning vaziyatini tushunish uchun 4 ta savol yaratish.

QOIDALAR:
- Har bir savol foydalanuvchining HOZIRGI VAZIYATINI tushunishga qaratilgan bo'lsin
- Savollar: tajriba, jihozlar/resurslar, ish joyi, yordam bera oladigan odamlar haqida bo'lsin
- Har bir savolda 3-4 ta javob varianti bo'lsin
- Javob variantlari ANIQ va REAL bo'lsin
- Savol va javoblar o'zbek tilida bo'lsin

JAVOB — FAQAT JSON:
{
  "questions": [
    {
      "id": "other_q1",
      "text_uz": "savol matni",
      "options": [
        {"value": "qisqa_id", "label_uz": "javob matni"},
        {"value": "qisqa_id2", "label_uz": "javob matni 2"}
      ]
    },
    {
      "id": "other_q2",
      "text_uz": "...",
      "options": [...]
    },
    {
      "id": "other_q3",
      "text_uz": "...",
      "options": [...]
    },
    {
      "id": "other_q4",
      "text_uz": "...",
      "options": [...]
    }
  ]
}`;

    const userPrompt = `Foydalanuvchi quyidagi biznesni qilmoqchi: "${description}"

Bu biznes uchun 4 ta savol yarat:
1-savol: Bu sohada tajribasi bormi? (tajriba darajasi)
2-savol: Qanday jihozlari/resurslari bor? (mavjud resurslar)
3-savol: Qayerda ishlash rejasi? (ish joyi)
4-savol: Kim yordam bera oladi? (jamoa/oila)

Har bir savolda 3-4 ta javob varianti bo'lsin.`;

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return Response.json(
        { error: "AI response parsing failed" },
        { status: 500 }
      );
    }

    const result = JSON.parse(text.slice(start, end + 1));
    return Response.json(result);
  } catch (err) {
    console.error("generate-questions error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
