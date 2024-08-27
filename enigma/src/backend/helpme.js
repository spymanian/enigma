import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { role: "system", content: "You are a mastermind in a murder mystery game." },
        {
            role: "user",
            content: "Introduce the player in the second person point of view as an investigator named Joe for a themed house that just had a murder of a John Doe. The theme is Anime. Explain that the house is shaped like icosahedron with 12 rooms and 30 different paths. Make it one to two sentences",
        },
    ],
});

console.log(completion.choices[0].message['content']);
